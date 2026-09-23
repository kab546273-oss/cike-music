"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Pause, Play, SkipForward } from "lucide-react";
import type { Song } from "@/types";
import { cn } from "@/lib/utils";
import SongCover from "./SongCover";

interface SongCardProps {
  song: Song;
  index: number;
  onPlay: () => void;
  isPlaying?: boolean;
  onSkip?: () => void;
}

/** A single scrapbook-style track row. */
export default function SongCard({ song, index, onPlay, isPlaying, onSkip }: SongCardProps) {
  const [liked, setLiked] = useState(false);
  const rotation = -0.5 + index * 0.15;
  const tags = [
    `${song.bpm} BPM`,
    song.style[0],
    song.mood[0],
  ].filter(Boolean);

  return (
    <motion.div
      layout
      style={{ rotate: rotation }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="paper-card flex items-center gap-3 rounded-md p-3"
    >
      <span className="handwritten w-7 shrink-0 text-center text-2xl leading-none text-brown">
        {String(index + 1).padStart(2, "0")}
      </span>

      <button
        type="button"
        onClick={onPlay}
        className="shrink-0 rounded-full bg-paper-dark p-2 text-ink transition-colors hover:bg-olive hover:text-paper-light"
        aria-label={isPlaying ? `暂停 ${song.title}` : `播放 ${song.title}`}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} className="translate-x-[1px]" />}
      </button>

      <SongCover song={song} size={48} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{song.title}</p>
        <p className="truncate text-xs text-brown">{song.artist}</p>
        <p className="mt-0.5 truncate text-[11px] uppercase tracking-wide text-brown/70">
          {tags.join("  ·  ")}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setLiked((v) => !v)}
        className={cn(
          "shrink-0 rounded-full p-1.5 transition-colors",
          liked ? "text-brick" : "text-brown/50 hover:text-brick"
        )}
        aria-label="收藏"
      >
        <Heart size={16} fill={liked ? "currentColor" : "none"} />
      </button>

      {onSkip ? (
        <button
          type="button"
          onClick={onSkip}
          className="shrink-0 rounded-full p-1.5 text-brown/50 transition-colors hover:text-ink"
          aria-label="不喜欢这首"
          title="不喜欢这首"
        >
          <SkipForward size={16} />
        </button>
      ) : null}
    </motion.div>
  );
}
