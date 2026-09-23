"use client";

import { motion } from "framer-motion";
import type { MusicPreferences } from "@/types";
import { MOOD_VALUE_TO_LABEL, SCENE_LABEL_MAP, VOCAL_LABEL } from "@/lib/constants";
import PaperCard from "@/components/scrapbook/PaperCard";

interface AIInterpretationProps {
  preferences: MusicPreferences;
}

/** The most important evidence card: what AI understood about the moment. */
export default function AIInterpretation({ preferences }: AIInterpretationProps) {
  const sceneLabel = preferences.scene ? SCENE_LABEL_MAP[preferences.scene] : null;
  const moodLabel = preferences.mood ? MOOD_VALUE_TO_LABEL[preferences.mood] : null;
  const vocalLabel = VOCAL_LABEL[preferences.vocal] ?? "中人声";

  const rows: Array<{ icon: string; label: string; value: React.ReactNode }> = [
    { icon: "☕", label: "场景", value: sceneLabel ?? "随心情" },
    { icon: "🌿", label: "情绪", value: moodLabel ?? "随性" },
    { icon: "〰️", label: "节奏", value: `${preferences.bpm_min} — ${preferences.bpm_max} BPM` },
    { icon: "🎧", label: "人声", value: vocalLabel },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
    >
      <PaperCard tape rotation={-0.8} className="mx-auto max-w-md p-6">
        <h3 className="handwritten mb-4 text-center text-3xl text-ink">
          ✦ 我听懂了你的现在
        </h3>

        <motion.ul
          className="flex flex-col gap-2.5"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
        >
          {rows.map((row) => (
            <motion.li
              key={row.label}
              variants={{
                hidden: { opacity: 0, x: -8 },
                show: { opacity: 1, x: 0 },
              }}
              className="flex items-center gap-2 text-sm"
            >
              <span aria-hidden className="w-6 text-center">{row.icon}</span>
              <span className="w-10 text-brown">{row.label}</span>
              <span className="font-medium text-ink">{row.value}</span>
            </motion.li>
          ))}

          {preferences.exclude_style.length > 0 ? (
            <motion.li
              variants={{
                hidden: { opacity: 0, x: -8 },
                show: { opacity: 1, x: 0 },
              }}
              className="flex flex-wrap items-center gap-2 text-sm"
            >
              <span aria-hidden className="w-6 text-center">🚫</span>
              <span className="w-10 text-brown">避开</span>
              <span className="flex flex-wrap gap-1.5">
                {preferences.exclude_style.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-paper-dark px-2 py-0.5 text-xs text-brown line-through"
                  >
                    {s}
                  </span>
                ))}
              </span>
            </motion.li>
          ) : null}
        </motion.ul>
      </PaperCard>
    </motion.div>
  );
}
