"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import type { MusicPreferences, ParseResponse } from "@/types";
import { MOOD_PRESETS, SCENE_PRESETS } from "@/lib/constants";
import { encodePreferences } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import Navbar from "@/components/layout/Navbar";
import PaperCard from "@/components/scrapbook/PaperCard";
import SceneCard from "@/components/music/SceneCard";
import MoodTag from "@/components/music/MoodTag";
import AIThinking from "@/components/ai/AIThinking";

export default function HomePage() {
  const router = useRouter();
  const scenesRef = useRef<HTMLDivElement>(null);

  const [text, setText] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [thinking, setThinking] = useState(false);
  const [parseError, setParseError] = useState(false);

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

  const toggleMood = (id: string) => {
    setSelectedMoods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleTextSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    trackEvent("text_submit", { text: trimmed });
    setThinking(true);
    setParseError(false);
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
      setParseError(true);
      setThinking(false);
      setTimeout(() => scenesRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {
      setParseError(true);
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
        {/* Hero */}
        <section className="pt-12 text-center sm:pt-16">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="handwritten text-5xl leading-tight text-ink sm:text-6xl"
          >
            现在的你，
            <br />
            <span className="text-brick">想听什么？</span>
          </motion.h1>
          <p className="mt-4 text-brown">不用找歌，告诉我这一刻。</p>
        </section>

        {/* Natural language input */}
        <section className="mx-auto mt-8 max-w-xl">
          <PaperCard rotation={-0.4} className="p-5">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="下午有点累，想喝杯咖啡看会儿书……"
              className="w-full resize-none rounded-md border border-paper-dark bg-paper-light/60 p-3 text-sm text-ink placeholder:text-brown/60 focus:border-olive focus:outline-none"
            />
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

          <div className="mt-4">
            <AIThinking visible={thinking} />
          </div>

          {parseError ? (
            <p className="mt-4 text-center text-sm text-brown">
              我还不太确定你的状态，可以从下面选一个场景。
            </p>
          ) : null}
        </section>

        {/* Mood tags */}
        <section className="mt-12">
          <h2 className="handwritten mb-4 text-3xl text-ink">此刻的心情</h2>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
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
          <h2 className="handwritten mb-5 text-3xl text-ink">或者选一个场景</h2>
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
