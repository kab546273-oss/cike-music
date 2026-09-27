"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import type { MusicPreferences, ParseFailureReason, ParseResponse } from "@/types";
import { MOOD_PRESETS, SCENE_PRESETS } from "@/lib/constants";
import { encodePreferences } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import Navbar from "@/components/layout/Navbar";
import PaperCard from "@/components/scrapbook/PaperCard";
import SceneCard from "@/components/music/SceneCard";
import MoodTag from "@/components/music/MoodTag";
import HeroNote from "@/components/home/HeroNote";

/** 输入框轮播示例：每 4 秒换一句，像有人在提示你说什么。 */
const PLACEHOLDER_SAMPLES = [
  "下午有点累，想喝杯咖啡看会儿书",
  "睡不着，想听点安静的……",
  "想去跑个步，来点有劲的",
  "在图书馆复习，别放有人唱的歌",
  "通勤路上，想听点轻松的",
  "周末晚上，想微醺一下",
];
const HINT_INTERVAL_MS = 4000;

/** 失败原因 → 用户能看懂的下一步（旧版无论什么原因都说同一句话）。 */
function parseErrorMessage(reason: ParseFailureReason): string {
  switch (reason) {
    case "LLM_NOT_CONFIGURED":
      return "自然语言解析还没接通（服务端未配置模型密钥），先从下面选一个场景吧。";
    case "LLM_TIMEOUT":
      return "AI 这次想得有点久，先给你一个场景，或者再描述一次。";
    case "INVALID_OUTPUT":
      return "AI 的回答我没能读懂，换一种说法我再试一次？";
    case "LOW_CONFIDENCE":
      return "我还不太确定你的状态，可以从下面选一个场景。";
    default:
      return "刚才没能理解你的描述，可以从下面选一个场景。";
  }
}

export default function HomePage() {
  const router = useRouter();
  const scenesRef = useRef<HTMLDivElement>(null);

  const [text, setText] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [thinking, setThinking] = useState(false);
  const [parseError, setParseError] = useState<ParseFailureReason | null>(null);
  const [hintIndex, setHintIndex] = useState(0);

  // 轮播提示只在"还没开口、也没在解析"时滚动，不跟正在打字的用户抢
  useEffect(() => {
    if (text.length > 0 || thinking) return;
    const id = setInterval(
      () => setHintIndex((i) => (i + 1) % PLACEHOLDER_SAMPLES.length),
      HINT_INTERVAL_MS
    );
    return () => clearInterval(id);
  }, [text, thinking]);

  /** Encode preferences and jump to the generated playlist page. */
  const generatePlaylist = (prefs: MusicPreferences) => {
    const encoded = encodePreferences(prefs);
    router.push(`/playlist?p=${encoded}`);
  };

  const applyMoodOverride = (
    prefs: Omit<MusicPreferences, "confidence">
  ): MusicPreferences => ({
    ...prefs,
    mood: selectedMoods[0] ?? prefs.mood,
    confidence: 0.8,
  });

  /**
   * 心情标签是单选：MusicPreferences.mood 只能表达一个心情。
   * 旧版允许多选、却只取 selectedMoods[0]，选三个静默生效一个。
   */
  const toggleMood = (id: string) => {
    setSelectedMoods((prev) => (prev.includes(id) ? [] : [id]));
  };

  const handleTextSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    // 只上报长度，不上报用户原文（埋点会进服务端日志）。
    trackEvent("text_submit", { textLength: trimmed.length });
    setThinking(true);
    setParseError(null);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      const data = (await res.json()) as ParseResponse;
      if (data.success && data.preferences) {
        const prefs: MusicPreferences = {
          ...data.preferences,
          mood: selectedMoods[0] ?? data.preferences.mood,
          confidence: data.confidence ?? data.preferences.confidence,
        };
        trackEvent("playlist_generate", { source: "text", scene: prefs.scene });
        generatePlaylist(prefs);
        return;
      }
      // graceful degradation to scene picker
      setParseError(data.reason ?? "UNKNOWN");
      setThinking(false);
      setTimeout(() => scenesRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {
      setParseError("UNKNOWN");
      setThinking(false);
      setTimeout(() => scenesRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  const handleSceneClick = (sceneId: string) => {
    const scene = SCENE_PRESETS.find((s) => s.id === sceneId);
    if (!scene) return;
    trackEvent("scene_click", { scene: sceneId, mood: selectedMoods[0] ?? null });
    trackEvent("playlist_generate", { source: "scene", scene: sceneId });
    generatePlaylist(applyMoodOverride(scene.preferences));
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24">
        {/* Hero：便签 + 音乐拼贴 + 标题逐字写出；提交后换成"正在理解这一刻…" */}
        <HeroNote thinking={thinking} />

        {/* Natural language input */}
        <section className="mx-auto mt-8 max-w-xl">
          <PaperCard rotation={-0.4} className="p-5">
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                aria-label="说说这一刻，比如：下午有点累，想喝杯咖啡看会儿书"
                className="w-full resize-none rounded-md border border-paper-dark bg-paper-light/60 p-3 text-sm text-ink focus:border-olive focus:outline-none"
              />
              {/* 原生 placeholder 换成可以淡入淡出的轮播提示 */}
              {text.length === 0 && !thinking ? (
                <span
                  key={hintIndex}
                  aria-hidden
                  className="ph-fade pointer-events-none absolute left-3 top-3 text-sm text-brown"
                >
                  {PLACEHOLDER_SAMPLES[hintIndex]}
                </span>
              ) : null}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1 text-xs text-brown">
                <Sparkles size={12} /> ✦ AI 会帮你理解这一刻
              </span>
              <button
                type="button"
                onClick={handleTextSubmit}
                disabled={thinking || !text.trim()}
                className="inline-flex items-center gap-1.5 rounded-md bg-brick px-4 py-2 text-sm font-semibold text-paper-light transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="handwritten text-lg leading-none">帮我找歌</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </PaperCard>

          {parseError ? (
            <p className="mt-4 text-center text-sm text-brown">
              {parseErrorMessage(parseError)}
            </p>
          ) : null}
        </section>

        {/* Mood tags */}
        <section className="mt-12">
          <h2 className="handwritten mb-4 text-3xl text-ink">此刻的心情</h2>
          {/* 换成手绘图标后 chip 变宽，改为换行显示，避免第 12 个被裁掉 */}
          <div className="flex flex-wrap gap-2 pb-2">
            {MOOD_PRESETS.map((mood) => (
              <MoodTag
                key={mood.id}
                mood={mood}
                selected={selectedMoods.includes(mood.id)}
                onClick={() => toggleMood(mood.id)}
              />
            ))}
          </div>
        </section>

        {/* Scene cards */}
        <section ref={scenesRef} className="mt-10 scroll-mt-20">
          <h2 className="handwritten mb-5 text-3xl text-ink">此刻的场景</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {SCENE_PRESETS.map((scene) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                onClick={() => handleSceneClick(scene.id)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
