import type { CSSProperties } from "react";
import type { Song } from "@/types";
import { DOODLES } from "@/components/scrapbook/Doodles";

interface SongCoverProps {
  song: Song;
  /** pixel size (width & height) */
  size?: number;
  /** list index — used to avoid adjacent doodle repeats */
  index?: number;
  className?: string;
}

/** Simple FNV-1a hash. */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

// A few warm paper tones for sticker backing, all light enough
// that dark doodle lines stay readable.
const PAPER_TONES = [
  "#EFE3D2", // paper
  "#EADDC8",
  "#E8DCC8",
  "#EDDFCC",
  "#E6D5BF", // paper-dark
];

/**
 * A hand-drawn doodle sticker for a song. The doodle choice is
 * deterministic per song id, with slight rotation/scale jitter so
 * covers feel hand-placed rather than grid-aligned.
 */
export default function SongCover({ song, size = 56, index = 0, className }: SongCoverProps) {
  const h = hash(song.id + ":" + index);

  // Pick doodle — bias away from the previous one when index is known.
  let doodleIdx = h % DOODLES.length;
  if (index > 0) {
    const prevHash = hash(song.id.replace(/.$/, (c) => String.fromCharCode(c.charCodeAt(0) + 1)) + ":" + (index - 1));
    const prevIdx = prevHash % DOODLES.length;
    if (doodleIdx === prevIdx) doodleIdx = (doodleIdx + 3) % DOODLES.length;
  }

  const Doodle = DOODLES[doodleIdx];

  // Hand-placed jitter: -3° to 3° rotation, 0.92–1.0 scale.
  const rotation = ((h >> 4) % 7) - 3;
  const scale = 0.92 + ((h >> 8) % 15) / 100;

  const bg = PAPER_TONES[h % PAPER_TONES.length];

  const style: CSSProperties = {
    width: size,
    height: size,
    background: bg,
    transform: `rotate(${rotation}deg) scale(${scale})`,
  };

  return (
    <div
      style={style}
      className={`flex shrink-0 items-center justify-center rounded-md border border-brown/15 shadow-[0_1px_3px_rgba(48,43,39,0.12)] ${className ?? ""}`}
      aria-hidden
    >
      <Doodle size={size * 0.72} />
    </div>
  );
}
