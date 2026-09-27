"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, SkipBack, SkipForward, Sparkles } from "lucide-react";
import type { Song } from "@/types";
import { formatTime } from "@/lib/utils";
import SongCover from "@/components/music/SongCover";
import HandDrawnProgress from "./HandDrawnProgress";

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
          <div className="mx-auto flex max-w-3xl items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3">
            <SongCover song={song} size={40} />

            <div className="min-w-0 flex-1 sm:w-40 sm:flex-none">
              <p className="truncate text-sm font-semibold text-ink">{song.title}</p>
              <p className="truncate text-xs text-brown">{song.artist}</p>
            </div>

            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
              <button
                type="button"
                onClick={onPrev}
                className="flex h-11 w-11 items-center justify-center rounded-full text-brown transition-colors hover:text-ink"
                aria-label="上一首"
              >
                <SkipBack size={20} />
              </button>
              <button
                type="button"
                onClick={onPlayPause}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper-light transition-transform hover:scale-105"
                aria-label={isPlaying ? "暂停" : "播放"}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} className="translate-x-[1px]" />}
              </button>
              <button
                type="button"
                onClick={() => (onSkip ? onSkip() : onNext())}
                className="flex h-11 w-11 items-center justify-center rounded-full text-brown transition-colors hover:text-ink"
                aria-label={
                  onSkip ? "不喜欢这首" : "下一首，连续跳过会重新理解你的偏好"
                }
                title={onSkip ? "不喜欢这首" : "下一首（连续跳过 2 首触发重新理解）"}
              >
                <SkipForward size={20} />
              </button>
            </div>

            <div className="hidden flex-1 items-center gap-2 sm:flex">
              <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-brown">
                {formatTime(currentTime)}
              </span>
              <HandDrawnProgress
                progress={progress}
                isPlaying={isPlaying}
                songId={song.id}
                onSeek={onSeek}
                duration={duration}
              />
              <span className="w-10 shrink-0 text-[11px] tabular-nums text-brown">{formatTime(duration)}</span>
            </div>

            {onOpenLossless ? (
              <button
                type="button"
                onClick={onOpenLossless}
                className="ml-auto inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-olive px-3 text-[11px] font-semibold text-paper-light sm:ml-0"
              >
                <Sparkles size={12} /> 无损
              </button>
            ) : null}
          </div>

          {/* hand-drawn progress for mobile (hidden desktop) */}
          <div className="px-4 pb-2 sm:hidden">
            <HandDrawnProgress
              progress={progress}
              isPlaying={isPlaying}
              songId={song.id}
              onSeek={onSeek}
              duration={duration}
              compact
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
