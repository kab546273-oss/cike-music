import type { CSSProperties } from "react";
import type { Song } from "@/types";
import { generateGradient } from "@/lib/utils";

interface SongCoverProps {
  song: Song;
  /** pixel size (width & height) */
  size?: number;
  className?: string;
}

/**
 * Deterministic placeholder cover built from a CSS gradient derived from
 * the song id — no real image asset needed.
 */
export default function SongCover({ song, size = 56, className }: SongCoverProps) {
  const gradient = generateGradient(song.id);
  const letter = (song.title.trim().charAt(0) || "♪").toUpperCase();
  const style: CSSProperties = {
    width: size,
    height: size,
    background: gradient,
  };
  return (
    <div
      style={style}
      className={`flex shrink-0 items-center justify-center rounded-md font-semibold text-paper-light shadow-inner ${className ?? ""}`}
      aria-hidden
    >
      <span style={{ fontSize: Math.max(14, size * 0.42) }} className="leading-none">
        {letter}
      </span>
    </div>
  );
}
