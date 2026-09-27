"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Home, RefreshCw, Save } from "lucide-react";
import type {
  FeedbackResponse,
  MusicPreferences,
  Playlist,
  RecommendResponse,
  RecommendationContext,
  Song,
} from "@/types";
import {
  MAX_REGENERATIONS,
  MIN_AI_THINKING_MS,
  REGENERATION_MESSAGE,
  SCENE_LABEL_MAP,
  SKIP_THRESHOLD,
  moodLabel,
  styleLabel,
} from "@/lib/constants";
import { decodePreferences } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import {
  addToPlayHistory,
  getPlayHistory,
  getPlaylistById,
  getLikedSongs,
  savePlaylist,
  unlockLossless,
} from "@/lib/storage";
import Navbar from "@/components/layout/Navbar";
import SongCard from "@/components/music/SongCard";
import AIThinking from "@/components/ai/AIThinking";
import AIInterpretation from "@/components/ai/AIInterpretation";
import AIRegeneration from "@/components/ai/AIRegeneration";
import PlayerBar from "@/components/player/PlayerBar";
import MemberModal from "@/components/modals/MemberModal";
import { usePlayer } from "@/components/player/usePlayer";

function todayLabel(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 负反馈前后的差异 → 重生成动画里展示的真实 chip。
 * 旧版 AIRegeneration 用的是写死的默认值（− 高人声 / + 治愈），
 * 和 /api/feedback 真正算出来的调整毫无关系。
 */
function regenDiff(
  before: MusicPreferences,
  after: MusicPreferences
): { excluded: string[]; added: string[] } {
  const beforeExclude = new Set(before.exclude_style);
  const excluded = after.exclude_style
    .filter((style) => !beforeExclude.has(style))
    .map(styleLabel)
    .slice(0, 4);

  const added: string[] = [];
  if (before.mood !== after.mood) {
    const label = moodLabel(after.mood);
    if (label) added.push(label);
  }
  const beforeWidth = before.bpm_max - before.bpm_min;
  const afterWidth = after.bpm_max - after.bpm_min;
  if (afterWidth < beforeWidth) {
    added.push(`${after.bpm_min}–${after.bpm_max} BPM`);
  }

  return { excluded, added: added.slice(0, 4) };
}

function PlaylistContent() {
  const search = useSearchParams();

  const [preferences, setPreferences] = useState<MusicPreferences | null>(null);
  const [context, setContext] = useState<RecommendationContext | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState(false);
  /** 从「我的歌单」进来时直接回放保存的曲子，不重新推荐。 */
  const [isReplay, setIsReplay] = useState(false);

  const [skipCount, setSkipCount] = useState(0);
  const [skippedSongs, setSkippedSongs] = useState<Song[]>([]);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const [showRegen, setShowRegen] = useState(false);
  const [regenNotice, setRegenNotice] = useState(false);
  const [regenChips, setRegenChips] = useState<{
    excluded: string[];
    added: string[];
  } | null>(null);

  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saved, setSaved] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [shuffling, setShuffling] = useState(false);

  const bootedRef = useRef(false);
  const regenerationCountRef = useRef(regenerationCount);
  const skipCountRef = useRef(skipCount);
  const preferencesRef = useRef<MusicPreferences | null>(null);
  const skippedSongsRef = useRef<Song[]>([]);
  /** 最近播放过的歌曲 id —— 推荐引擎第五个维度（history）的输入。 */
  const historyRef = useRef<string[]>([]);
  const regenInFlightRef = useRef(false);
  const pendingRegenRef = useRef<{
    preferences: MusicPreferences;
    songs: Song[];
    context: RecommendationContext | null;
    regenerationCount?: number;
  } | null>(null);

  useEffect(() => {
    regenerationCountRef.current = regenerationCount;
  }, [regenerationCount]);
  useEffect(() => {
    skipCountRef.current = skipCount;
  }, [skipCount]);
  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);
  useEffect(() => {
    skippedSongsRef.current = skippedSongs;
  }, [skippedSongs]);

  const resetSkipState = useCallback(() => {
    skipCountRef.current = 0;
    setSkipCount(0);
    setSkippedSongs([]);
    skippedSongsRef.current = [];
  }, []);

  /**
   * 连续跳过 ≥ SKIP_THRESHOLD 首后触发重生成。
   *
   * 与旧版的区别：
   *  1. 负反馈请求与纸片翻页动画**并行**（旧版等动画 3.7s 播完才发请求）；
   *  2. 动画里展示的 chip 来自 /api/feedback 的真实调整结果；
   *  3. 重生成后的歌单直接复用接口返回的 songs，不再多打一次 /api/recommend。
   */
  const requestRegeneration = useCallback(async () => {
    const current = preferencesRef.current;
    if (!current || regenInFlightRef.current) return;
    regenInFlightRef.current = true;

    setRegenChips(null);
    setShowRegen(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: current,
          skippedSongs: skippedSongsRef.current,
          regenerationCount: regenerationCountRef.current,
          history: historyRef.current,
        }),
      });
      const data = (await res.json()) as FeedbackResponse;

      if (data.success && data.shouldRegenerate && data.adjustedPreferences) {
        pendingRegenRef.current = {
          preferences: data.adjustedPreferences,
          songs: data.songs ?? [],
          context: data.context ?? null,
          regenerationCount: data.regenerationCount,
        };
        setRegenChips(regenDiff(current, data.adjustedPreferences));
      } else {
        // 达到重生成上限，或反馈计算失败：收起动画，只提示换个描述。
        pendingRegenRef.current = null;
        setShowRegen(false);
        setRegenNotice(true);
      }
    } catch {
      pendingRegenRef.current = null;
      setShowRegen(false);
    } finally {
      regenInFlightRef.current = false;
    }
  }, []);

  const handleCompletePlay = useCallback(
    (song: Song) => {
      historyRef.current = addToPlayHistory([song.id]);
      resetSkipState();
    },
    [resetSkipState]
  );

  const handleSkip = useCallback(
    (song: Song) => {
      trackEvent("song_skip", { songId: song.id });
      historyRef.current = addToPlayHistory([song.id]);

      const nextSkipped = [...skippedSongsRef.current, song];
      skippedSongsRef.current = nextSkipped;
      setSkippedSongs(nextSkipped);

      const nextCount = skipCountRef.current + 1;
      skipCountRef.current = nextCount;
      setSkipCount(nextCount);

      if (nextCount < SKIP_THRESHOLD) return;
      if (regenerationCountRef.current >= MAX_REGENERATIONS) {
        setRegenNotice(true);
        return;
      }
      void requestRegeneration();
    },
    [requestRegeneration]
  );

  const player = usePlayer({
    onCompletePlay: handleCompletePlay,
    onSkip: handleSkip,
  });
  const { loadPlaylist, next, playSong, prev, seek, togglePlay } = player;

  /** 把一次推荐结果写进页面状态与播放器。 */
  const applyRecommendation = useCallback(
    (nextSongs: Song[], nextContext: RecommendationContext | null) => {
      setSongs(nextSongs);
      setContext(nextContext);
      setReason(nextContext?.reason ?? "");
      loadPlaylist(nextSongs, 0);
    },
    [loadPlaylist]
  );

  /** POST /api/recommend 并填入歌曲。 */
  const runRecommend = useCallback(
    async (prefs: MusicPreferences) => {
      setLoading(true);
      setFatalError(false);
      try {
        const [res] = await Promise.all([
          fetch("/api/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              preferences: prefs,
              history: historyRef.current,
            }),
          }),
          // 推荐是纯本地计算（实测 3~4ms），不设最短展示时长的话
          // AIThinking 的 5 步动效只会闪一帧就消失。
          delay(MIN_AI_THINKING_MS),
        ]);
        const data = (await res.json()) as RecommendResponse;
        if (data.success && data.songs) {
          applyRecommendation(data.songs, data.context ?? null);
        } else {
          setFatalError(true);
        }
      } catch {
        setFatalError(true);
      } finally {
        setLoading(false);
      }
    },
    [applyRecommendation]
  );

  // boot: 回放已保存歌单，或解码 ?p= 后推荐
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    historyRef.current = getPlayHistory();

    const replayId = search.get("id");

    // 这个 effect 是一次性的启动读取（URL 参数 + localStorage 里的歌单/收藏），
    // 每个分支都必须同步写入初始状态；它只跑一次，不存在规则担心的级联渲染。
    // 用块级 disable 而不是行级：分支会随功能增加而变多，行级注释会不断
    // "漂"到新的第一个 setState 上（上一版就出现过 error + 多余 disable 并存）。
    /* eslint-disable react-hooks/set-state-in-effect */
    // "我喜欢" 是虚拟歌单，从 liked songs 直接取
    if (replayId === "__liked__") {
      const likedSongs = getLikedSongs();
      setIsReplay(true);
      setLoading(false);
      setSaveName("我喜欢");
      applyRecommendation(likedSongs, {
        scene: null, mood: null, bpmRange: "all", vocal: "medium",
        exclude_style: [], regenerationCount: 0,
        reason: "你标记喜欢的歌。", relaxations: [],
      });
      return;
    }

    const saved = replayId ? getPlaylistById(replayId) : null;
    if (saved) {
      setPreferences(saved.preferences);
      preferencesRef.current = saved.preferences;
      setRegenerationCount(saved.context?.regenerationCount ?? 0);
      setSaveName(saved.name);
      setIsReplay(true);
      setLoading(false);
      applyRecommendation(saved.songs, saved.context ?? null);
      return;
    }

    const p = decodePreferences(search.get("p"));
    if (!p) {
      setFatalError(true);
      setLoading(false);
      return;
    }
    setPreferences(p);
    preferencesRef.current = p;
    setSaveName(`${todayLabel()} · ${SCENE_LABEL_MAP[p.scene ?? ""] ?? "随心一刻"}`);
    void runRecommend(p);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [search, runRecommend, applyRecommendation]);

  /** 纸片翻页动画播完：应用已经拿到的调整结果。 */
  const handleRegenComplete = useCallback(() => {
    setShowRegen(false);
    const pending = pendingRegenRef.current;
    pendingRegenRef.current = null;

    if (pending) {
      setPreferences(pending.preferences);
      preferencesRef.current = pending.preferences;
      applyRecommendation(pending.songs, pending.context);
      const nextCount = pending.regenerationCount ?? regenerationCountRef.current + 1;
      setRegenerationCount(nextCount);
      trackEvent("playlist_regenerate", { regenerationCount: nextCount });
    }

    setRegenChips(null);
    setRegenNotice(false);
    resetSkipState();
  }, [applyRecommendation, resetSkipState]);

  /** 列表里的「不喜欢这首」：记录负反馈；如果是当前曲目就顺带切歌。 */
  const handleSongDislike = useCallback(
    (song: Song) => {
      handleSkip(song);
      if (player.state.currentSong?.id === song.id) next(false);
    },
    [handleSkip, next, player.state.currentSong]
  );

  const handleSave = () => {
    if (!preferences || songs.length === 0) return;
    const playlist: Playlist = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `pl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: saveName.trim() || `${todayLabel()} · 随心一刻`,
      createdAt: Date.now(),
      songs,
      preferences,
      context: context ?? {
        scene: preferences.scene,
        mood: preferences.mood,
        bpmRange: `${preferences.bpm_min}—${preferences.bpm_max}`,
        vocal: preferences.vocal,
        exclude_style: preferences.exclude_style,
        regenerationCount,
        reason,
        relaxations: [],
      },
    };
    savePlaylist(playlist);
    trackEvent("playlist_save", { name: playlist.name, count: songs.length });
    setSaveOpen(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  /** 换一批：同一份偏好，排除当前歌单里的歌，重新取一批。 */
  const handleShuffle = useCallback(async () => {
    const current = preferencesRef.current;
    if (!current || shuffling || songs.length === 0) return;
    setShuffling(true);
    trackEvent("playlist_shuffle", { currentCount: songs.length });
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: current,
          history: historyRef.current,
          excludeIds: songs.map((s) => s.id),
        }),
      });
      const data = (await res.json()) as RecommendResponse;
      if (data.success && data.songs && data.songs.length > 0) {
        applyRecommendation(data.songs, data.context ?? null);
        resetSkipState();
      }
    } catch {
      // silently keep the old batch
    } finally {
      setShuffling(false);
    }
  }, [shuffling, songs, applyRecommendation, resetSkipState]);

  const { currentSong, isPlaying, currentTime, duration, progress } = player.state;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-32">
        <section className="pt-10 text-center">
          <h1 className="handwritten text-5xl text-ink">
            给{preferences?.scene ? SCENE_LABEL_MAP[preferences.scene] ?? "这一刻" : "这一刻"}的你
          </h1>
          <p className="mt-2 text-brown">
            {isReplay ? `手账里的 ${songs.length} 首，原样放给你` : `${songs.length || 10} 首刚刚好的歌`}
          </p>
        </section>

        {!isReplay ? (
          <div className="mt-8">
            <AIThinking visible={loading} />
          </div>
        ) : null}

        {(!loading || isReplay) && preferences && !fatalError ? (
          <>
            <div className="mt-6">
              <AIInterpretation
                preferences={preferences}
                context={context}
                songCount={songs.length}
              />
            </div>

            {regenNotice ? (
              <div className="mx-auto mt-5 max-w-md">
                {/* 和首页 Tips 用同一套纸片语言（.paper-slip） */}
                <div className="paper-slip p-4">
                  <p className="text-sm text-ink">{REGENERATION_MESSAGE}</p>
                </div>
              </div>
            ) : null}

            {/* action row: 换一批 + 保存这一刻 */}
            <div className="mt-8 flex flex-col items-center gap-3">
              {saveOpen ? (
                <div className="paper-card flex w-full max-w-sm items-center gap-2 rounded-md p-2">
                  <input
                    autoFocus
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    className="flex-1 bg-transparent px-2 text-sm text-ink focus:outline-none"
                    placeholder="给这一刻起个名字"
                  />
                  <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-md bg-brick px-3 py-1.5 text-sm font-semibold text-paper-light"
                  >
                    保存
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSaveOpen(true)}
                    className="inline-flex items-center gap-2 rounded-md bg-brick px-5 py-2.5 text-sm font-semibold text-paper-light transition-transform hover:scale-[1.03]"
                  >
                    <Save size={15} /> {isReplay ? "另存为这一刻" : "保存这一刻"}
                  </button>
                  {!isReplay && songs.length > 0 ? (
                    <button
                      type="button"
                      onClick={handleShuffle}
                      disabled={shuffling}
                      className="inline-flex items-center gap-1.5 rounded-md border border-brown/20 bg-paper px-4 py-2.5 text-sm font-medium text-brown transition-colors hover:border-brown/40 hover:text-ink disabled:opacity-50"
                    >
                      <RefreshCw size={14} className={shuffling ? "animate-spin" : ""} />
                      {shuffling ? "换一批…" : "换一批"}
                    </button>
                  ) : null}
                </div>
              )}
              {saved ? (
                <span className="inline-flex items-center gap-1 text-sm text-[#5f6a4c]">
                  <Check size={15} /> 已收入你的音乐手账
                </span>
              ) : null}
            </div>

            {/* song list */}
            {songs.length === 0 ? (
              <div className="mt-12 text-center">
                <p className="text-brown">这一刻有点难找，我们换一种描述试试。</p>
                <Link
                  href="/"
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-paper px-4 py-2 text-sm font-medium text-ink shadow-sm"
                >
                  <Home size={15} /> 回到此刻
                </Link>
              </div>
            ) : (
              <motion.ul layout className="mt-8 flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                  {songs.map((song, i) => (
                    <motion.li
                      key={song.id}
                      layout
                      initial={{ opacity: 0, y: 16, rotate: -2 }}
                      animate={{ opacity: 1, y: 0, rotate: 0 }}
                      exit={{ opacity: 0, y: -14, scale: 0.96, rotate: 2 }}
                      transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    >
                      <SongCard
                        song={song}
                        index={i}
                        isPlaying={isPlaying && currentSong?.id === song.id}
                        disliked={skippedSongs.some((s) => s.id === song.id)}
                        onPlay={() => {
                          trackEvent("song_play", { songId: song.id });
                          playSong(song);
                        }}
                        onSkip={() => handleSongDislike(song)}
                      />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            )}
          </>
        ) : null}

        {!loading && fatalError ? (
          <div className="mt-12 text-center">
            <p className="text-brown">
              {preferences
                ? "刚才的歌没能准备好，我们回起点重新说一句吧。"
                : "我还没看懂你的描述，回首页换个说法试试。"}
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-paper px-4 py-2 text-sm font-medium text-ink shadow-sm"
            >
              <Home size={15} /> 回到此刻
            </Link>
          </div>
        ) : null}
      </main>

      {/* Regeneration overlay */}
      <AnimatePresence>
        {showRegen ? (
          <motion.div
            key="regen-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-4 backdrop-blur-sm"
          >
            <AIRegeneration
              visible={showRegen}
              onComplete={handleRegenComplete}
              excluded={regenChips?.excluded ?? []}
              added={regenChips?.added ?? []}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <PlayerBar
        song={currentSong}
        isPlaying={isPlaying}
        progress={progress}
        currentTime={currentTime}
        duration={duration}
        onPlayPause={togglePlay}
        onNext={() => next(true)}
        onPrev={prev}
        onSeek={seek}
        onOpenLossless={() => {
          trackEvent("member_modal_view");
          unlockLossless();
          window.dispatchEvent(new Event("cike:lossless-unlocked"));
          setMemberOpen(true);
        }}
      />

      <MemberModal open={memberOpen} onClose={() => setMemberOpen(false)} />
    </div>
  );
}

export default function PlaylistPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-brown">加载中……</div>}>
      <PlaylistContent />
    </Suspense>
  );
}
