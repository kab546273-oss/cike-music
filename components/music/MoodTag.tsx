"use client";

import type { MoodPreset } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MoodTagProps {
  mood: MoodPreset;
  selected?: boolean;
  onClick: () => void;
}

/** A selectable mood chip (multi-select overlay). */
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
      <span aria-hidden className="text-base leading-none">
        {mood.emoji}
      </span>
      <span>{mood.label}</span>
    </button>
  );
}
