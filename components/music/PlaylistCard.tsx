"use client";

import { motion } from "framer-motion";
import { Play, X } from "lucide-react";
import type { Playlist } from "@/types";
import { MOOD_PRESETS, SCENE_PRESETS } from "@/lib/constants";
import PaperCard from "@/components/scrapbook/PaperCard";

interface PlaylistCardProps {
  playlist: Playlist;
  onPlay: () => void;
  onDelete?: () => void;
}

function formatMMDD(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/** A saved-moment playlist card in the journal. */
export default function PlaylistCard({ playlist, onPlay, onDelete }: PlaylistCardProps) {
  const scene = SCENE_PRESETS.find((s) => s.id === playlist.preferences.scene);
  const mood = MOOD_PRESETS.find((m) => m.id === playlist.preferences.mood);

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="relative"
    >
      <PaperCard tape rotation={-1} className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-start justify-between">
          <span className="handwritten text-2xl text-brown">{formatMMDD(playlist.createdAt)}</span>
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-full p-1 text-brown/40 transition-colors hover:text-brick"
              aria-label="删除这个歌单"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>

        <p className="text-base font-semibold text-ink">{playlist.name}</p>

        <div className="flex flex-wrap items-center gap-1.5 text-xs text-brown">
          {scene ? <span>{scene.emoji} {scene.label}</span> : null}
          {mood ? <span>{mood.emoji} {mood.label}</span> : null}
          <span className="text-brown/70">· {playlist.songs.length} 首</span>
        </div>

        <button
          type="button"
          onClick={onPlay}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-md bg-brick px-4 py-2 text-sm font-semibold text-paper-light transition-transform hover:brightness-105"
        >
          <Play size={14} fill="currentColor" /> PLAY
        </button>
      </PaperCard>
    </motion.div>
  );
}
