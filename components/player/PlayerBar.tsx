"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, SkipBack, SkipForward, Sparkles } from "lucide-react";
import type { Song } from "@/types";
import { formatTime } from "@/lib/utils";
import SongCover from "@/components/music/SongCover";

interface PlayerBarProps {
  song: Song | null;
  isPlaying: boolean;
  /** 0 ~ 1 */
  progress: number;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
  onSkip?: () => void;
  onOpenLossless?: () => void;
}

/** Floating bottom player — scrapbook paper style, not a streaming-app clone. */
export default function PlayerBar({
  song,
  isPlaying,
  progress,
  currentTime,
  duration,
  onPlayPause,
  onNext,
  onPrev,
  onSeek,
  onSkip,
  onOpenLossless,
}: PlayerBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current || duration <= 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
  };

  return (
    <AnimatePresence>
      {song ? (
        <motion.div
          key="player"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-paper-dark bg-paper/95 shadow-[0_-4px_20px_rgba(48,43,39,0.12)] backdrop-blur"
        >
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
            <SongCover song={song} size={44} />

            <div className="min-w-0 w-28 sm:w-40">
              <p className="truncate text-sm font-semibold text-ink">{song.title}</p>
              <p className="truncate text-xs text-brown">{song.artist}</p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onPrev}
                className="rounded-full p-2 text-brown transition-colors hover:text-ink"
                aria-label="上一首"
              >
                <SkipBack size={18} />
              </button>
              <button
                type="button"
                onClick={onPlayPause}
                className="rounded-full bg-ink p-2.5 text-paper-light transition-transform hover:scale-105"
                aria-label={isPlaying ? "暂停" : "播放"}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-[1px]" />}
              </button>
              <button
                type="button"
                onClick={() => (onSkip ? onSkip() : onNext())}
                className="rounded-full p-2 text-brown transition-colors hover:text-ink"
                aria-label={onSkip ? "不喜欢这首" : "下一首"}
              >
                <SkipForward size={18} />
              </button>
            </div>

            <div className="hidden flex-1 items-center gap-2 sm:flex">
              <span className="w-10 text-right text-[11px] tabular-nums text-brown">
                {formatTime(currentTime)}
              </span>
              <div
                ref={barRef}
                onClick={handleSeekClick}
                className="group relative h-1.5 flex-1 cursor-pointer rounded-full bg-paper-dark"
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-brick"
                  style={{ width: `${progress * 100}%` }}
                />
                <div
                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brick opacity-0 shadow transition-opacity group-hover:opacity-100"
                  style={{ left: `${progress * 100}%` }}
                />
              </div>
              <span className="w-10 text-[11px] tabular-nums text-brown">{formatTime(duration)}</span>
            </div>

            {onOpenLossless ? (
              <button
                type="button"
                onClick={onOpenLossless}
                className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-olive px-2.5 py-1 text-[11px] font-semibold text-paper-light sm:ml-0"
              >
                <Sparkles size={12} /> 无损
              </button>
            ) : null}
          </div>

          {/* thin progress bar for mobile (hidden desktop) */}
          <div className="h-0.5 w-full bg-paper-dark sm:hidden">
            <div className="h-full bg-brick" style={{ width: `${progress * 100}%` }} />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
