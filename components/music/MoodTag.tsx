"use client";

import type { MoodPreset } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { DOODLE_INK_LIGHT, MoodIcon } from "@/components/scrapbook/DoodleIcons";

interface MoodTagProps {
  mood: MoodPreset;
  selected?: boolean;
  onClick: () => void;
}

/** A selectable mood chip. Single-select — MusicPreferences.mood holds one value. */
export default function MoodTag({ mood, selected, onClick }: MoodTagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        selected
          ? "border-brick bg-brick text-paper-light shadow-[0_2px_6px_rgba(184,111,94,0.35)]"
          : "border-paper-dark bg-paper text-ink hover:bg-paper-dark"
      )}
    >
      {/* 选中的 chip 是砖红底，墨线要换成纸白色才够对比 */}
      <MoodIcon
        id={mood.id}
        size={18}
        className="shrink-0"
        strokeColor={selected ? DOODLE_INK_LIGHT : undefined}
      />
      <span>{mood.label}</span>
    </button>
  );
}
