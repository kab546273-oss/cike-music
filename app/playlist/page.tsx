"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Home, Save } from "lucide-react";
import type {
  FeedbackResponse,
  MusicPreferences,
  RecommendResponse,
  Song,
} from "@/types";
import { SCENE_LABEL_MAP } from "@/lib/constants";
import { decodePreferences } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { savePlaylist } from "@/lib/storage";
import Navbar from "@/components/layout/Navbar";
import SongCard from "@/components/music/SongCard";
import AIThinking from "@/components/ai/AIThinking";
import AIInterpretation from "@/components/ai/AIInterpretation";
import AIRegeneration from "@/components/ai/AIRegeneration";
import PlayerBar from "@/components/player/PlayerBar";
import MemberModal from "@/components/modals/MemberModal";
import StickyNote from "@/components/scrapbook/StickyNote";
import { usePlayer } from "@/components/player/usePlayer";

const MAX_REGEN = 2;

function todayLabel(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function PlaylistContent() {
  const search = useSearchParams();

  const [preferences, setPreferences] = useState<MusicPreferences | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState(false);

  const [skipCount, setSkipCount] = useState(0);
  const [skippedSongs, setSkippedSongs] = useState<Song[]>([]);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const [showRegen, setShowRegen] = useState(false);
  const [regenNotice, setRegenNotice] = useState(false);

  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saved, setSaved] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);

  const bootedRef = useRef(false);
  const regenerationCountRef = useRef(regenerationCount);
  const skipCountRef = useRef(skipCount);
  useEffect(() => {
    regenerationCountRef.current = regenerationCount;
  }, [regenerationCount]);
  useEffect(() => {
    skipCountRef.current = skipCount;
  }, [skipCount]);

  const resetSkipState = useCallback(() => {
    skipCountRef.current = 0;
    setSkipCount(0);
    setSkippedSongs([]);
  }, []);

  const handleCompletePlay = useCallback(() => {
    resetSkipState();
  }, [resetSkipState]);

  const handleSkip = useCallback((song: Song) => {
    trackEvent("song_skip", { songId: song.id, title: song.title });
    setSkippedSongs((prev) => [...prev, song]);
    const nextCount = skipCountRef.current + 1;
    skipCountRef.current = nextCount;
    setSkipCount(nextCount);
    if (nextCount >= 2 && regenerationCountRef.current < MAX_REGEN) {
      setShowRegen(true);
    } else if (regenerationCountRef.current >= MAX_REGEN) {
      setRegenNotice(true);
    }
  }, []);

  const player = usePlayer({
    onCompletePlay: handleCompletePlay,
    onSkip: handleSkip,
  });

  /** POST /api/recommend and fill songs. */
  const runRecommend = useCallback(
    async (prefs: MusicPreferences) => {
      setLoading(true);
      setFatalError(false);
      try {
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preferences: prefs, history: [] }),
        });
        const data = (await res.json()) as RecommendResponse;
        if (data.success && data.songs) {
          setSongs(data.songs);
          setReason(data.context?.reason ?? "");
          player.loadPlaylist(data.songs, 0);
        } else {
          setFatalError(true);
        }
      } catch {
        setFatalError(true);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // boot: decode ?p= and recommend
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    const p = decodePreferences(search.get("p"));
    if (!p) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFatalError(true);
       
      setLoading(false);
      return;
    }
     
    setPreferences(p);
     
    setSaveName(`${todayLabel()} · ${SCENE_LABEL_MAP[p.scene ?? ""] ?? "随心一刻"}`);
    void runRecommend(p);
  }, [search, runRecommend]);

  /** Called when the paper-shuffle animation finishes. */
  const handleRegenComplete = useCallback(async () => {
    if (!preferences) return;
    setShowRegen(false);
    let adjusted = preferences;
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences,
          skippedSongs,
          regenerationCount,
        }),
      });
      const data = (await res.json()) as FeedbackResponse;
      if (data.success && data.adjustedPreferences) {
        adjusted = data.adjustedPreferences;
        setPreferences(adjusted);
      }
    } catch {
      /* fall back to current preferences */
    }
    trackEvent("playlist_regenerate", { regenerationCount: regenerationCount + 1 });
    resetSkipState();
    setRegenerationCount((c) => c + 1);
    await runRecommend(adjusted);
  }, [preferences, skippedSongs, regenerationCount, runRecommend, resetSkipState]);

  const handleSave = () => {
    if (!preferences || songs.length === 0) return;
    const playlist = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `pl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: saveName.trim() || `${todayLabel()} · 随心一刻`,
      createdAt: Date.now(),
      songs,
      preferences,
      context: {
        scene: preferences.scene,
        mood: preferences.mood,
        bpmRange: `${preferences.bpm_min}—${preferences.bpm_max}`,
        vocal: preferences.vocal,
        exclude_style: preferences.exclude_style,
        regenerationCount,
        reason,
      },
    };
    savePlaylist(playlist);
    trackEvent("playlist_save", { name: playlist.name, count: songs.length });
    setSaveOpen(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const { currentSong, isPlaying, currentTime, duration, progress } = player.state;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-32">
        <section className="pt-10 text-center">
          <h1 className="handwritten text-5xl text-ink">给这一刻的你</h1>
          <p className="mt-2 text-brown">10 首刚刚好的歌</p>
        </section>

        <div className="mt-8">
          <AIThinking visible={loading} />
        </div>

        {!loading && preferences && !fatalError ? (
          <>
            <div className="mt-6">
              <AIInterpretation preferences={preferences} />
            </div>

            {reason ? (
              <p className="mx-auto mt-5 max-w-md text-center text-sm text-brown">{reason}</p>
            ) : null}

            {regenNotice ? (
              <div className="mx-auto mt-5 max-w-md">
                <StickyNote>
                  <p className="text-sm text-ink">我们换个描述试试，也许会更接近你。</p>
                </StickyNote>
              </div>
            ) : null}

            {/* save row */}
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
                <button
                  type="button"
                  onClick={() => setSaveOpen(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-brick px-5 py-2.5 text-sm font-semibold text-paper-light transition-transform hover:scale-[1.03]"
                >
                  <Save size={15} /> 保存这一刻
                </button>
              )}
              {saved ? (
                <span className="inline-flex items-center gap-1 text-sm text-olive">
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
                        onPlay={() => {
                          trackEvent("song_play", { songId: song.id });
                          player.playSong(song);
                        }}
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
            <AIRegeneration visible={showRegen} onComplete={handleRegenComplete} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <PlayerBar
        song={currentSong}
        isPlaying={isPlaying}
        progress={progress}
        currentTime={currentTime}
        duration={duration}
        onPlayPause={player.togglePlay}
        onNext={() => player.next(true)}
        onPrev={player.prev}
        onSeek={player.seek}
        onSkip={() => player.next(true)}
        onOpenLossless={() => {
          trackEvent("member_modal_view");
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
