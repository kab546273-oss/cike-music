"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MoreHorizontal, Pause, Play, SkipForward } from "lucide-react";
import type { Song } from "@/types";
import { moodLabel, styleLabel } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { isLiked, toggleLikeSong, isLosslessUnlocked } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";
import SongCover from "./SongCover";

interface SongCardProps {
  song: Song;
  index: number;
  onPlay: () => void;
  isPlaying?: boolean;
  onSkip?: () => void;
  /** 已经点过「不喜欢」：弱化整行，让用户看到这一下被记住了。 */
  disliked?: boolean;
}

/** A single scrapbook-style track row. */
export default function SongCard({
  song,
  index,
  onPlay,
  isPlaying,
  onSkip,
  disliked = false,
}: SongCardProps) {
  const [liked, setLiked] = useState(() => isLiked(song.id));
  const [unlocked, setUnlocked] = useState(() => isLosslessUnlocked());
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const rotation = -0.5 + index * 0.15;

  // Listen for "lossless unlocked" event — badges fade in after user opens member modal
  useEffect(() => {
    const handler = () => setUnlocked(true);
    window.addEventListener("cike:lossless-unlocked", handler);
    return () => window.removeEventListener("cike:lossless-unlocked", handler);
  }, []);

  /** Toggle like and persist to localStorage. */
  const handleLike = () => {
    const nowLiked = toggleLikeSong(song);
    setLiked(nowLiked);
    trackEvent("song_like", { songId: song.id, liked: nowLiked });
  };

  const tags = [
    `${song.bpm} BPM`,
    song.style[0] ? styleLabel(song.style[0]) : null,
    moodLabel(song.mood[0]),
  ].filter(Boolean);

  // Close the ⋯ menu when tapping outside
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <motion.div
      layout
      style={{ rotate: rotation }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "paper-card relative flex items-center gap-2 sm:gap-3 rounded-md p-2 sm:p-3",
        disliked && "opacity-60"
      )}
    >
      {/* Row number — hidden on mobile (saves ~28px) */}
      <span className="handwritten hidden w-7 shrink-0 text-center text-2xl leading-none text-brown sm:block">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Play button — ≥40px touch target on mobile */}
      <button
        type="button"
        onClick={onPlay}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-dark text-ink transition-colors hover:bg-olive hover:text-paper-light sm:h-9 sm:w-9 sm:p-0"
        aria-label={isPlaying ? `暂停 ${song.title}` : `播放 ${song.title}`}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} className="translate-x-[1px]" />}
      </button>

      {/* Cover — 40px mobile / 48px desktop */}
      <SongCover song={song} sizeClass="h-10 w-10 sm:h-12 sm:w-12" index={index} />

      {/* Text block */}
      <div className="min-w-0 flex-1">
        {/* Title row — mobile: title + artist on two lines, no tags here */}
        <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          <span className="truncate">{song.title}</span>
          <AnimatePresence>
            {song.is_lossless && unlocked ? (
              <motion.span
                initial={{ opacity: 0, scale: 0.6, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: "auto" }}
                exit={{ opacity: 0, scale: 0.6, width: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="shrink-0 overflow-hidden rounded-full border border-[#5f6a4c]/50 px-1.5 py-px text-[10px] font-medium text-[#5f6a4c]"
              >
                无损
              </motion.span>
            ) : null}
          </AnimatePresence>
        </p>
        <p className="truncate text-xs text-brown">{song.artist}</p>
        {/* Tags — second line, full width */}
        <p className="mt-0.5 truncate text-[11px] uppercase tracking-wide text-brown">
          {tags.join("  ·  ")}
        </p>
      </div>

      {/* Desktop: inline heart + skip (≥36px targets) */}
      <div className="hidden shrink-0 items-center gap-1 sm:flex">
        <button
          type="button"
          onClick={handleLike}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
            liked ? "text-brick" : "text-brown/85 hover:text-brick"
          )}
          aria-label="收藏"
        >
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
        </button>

        {onSkip ? (
          <button
            type="button"
            onClick={onSkip}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
              disliked ? "text-brick" : "text-brown/85 hover:text-ink"
            )}
            aria-label={disliked ? "已标记不喜欢" : "不喜欢这首"}
            title={disliked ? "已标记不喜欢" : "不喜欢这首"}
          >
            <SkipForward size={16} fill={disliked ? "currentColor" : "none"} />
          </button>
        ) : null}
      </div>

      {/* Mobile: ⋯ menu (≥44px touch target) */}
      <div className="relative shrink-0 sm:hidden" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-full text-brown/85 transition-colors hover:text-ink"
          aria-label="更多操作"
          aria-expanded={menuOpen}
        >
          <MoreHorizontal size={20} />
        </button>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12 }}
              className="paper-card absolute right-0 top-full z-20 mt-1 flex flex-col rounded-md p-1 shadow-lg"
            >
              <button
                type="button"
                onClick={() => {
                  handleLike();
                  setMenuOpen(false);
                }}
                className={cn(
                  "flex h-11 items-center gap-2 rounded px-3 text-sm transition-colors",
                  liked ? "text-brick" : "text-ink hover:bg-brown/5"
                )}
              >
                <Heart size={16} fill={liked ? "currentColor" : "none"} />
                {liked ? "已收藏" : "收藏"}
              </button>
              {onSkip ? (
                <button
                  type="button"
                  onClick={() => {
                    onSkip();
                    setMenuOpen(false);
                  }}
                  className={cn(
                    "flex h-11 items-center gap-2 rounded px-3 text-sm transition-colors",
                    disliked ? "text-brick" : "text-ink hover:bg-brown/5"
                  )}
                >
                  <SkipForward size={16} fill={disliked ? "currentColor" : "none"} />
                  {disliked ? "已不喜欢" : "不喜欢"}
                </button>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
