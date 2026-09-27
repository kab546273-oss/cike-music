"use client";

import { motion } from "framer-motion";
import { Play, X } from "lucide-react";
import type { Playlist } from "@/types";
import { MOOD_PRESETS, SCENE_PRESETS, moodLabel } from "@/lib/constants";
import PaperCard from "@/components/scrapbook/PaperCard";
import { MoodIcon, SceneIcon } from "@/components/scrapbook/DoodleIcons";

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
  // 心情 chip 被删掉后（例如「活力」），已保存的歌单依然要显示中文名，
  // 所以这里对 MOOD_PRESETS 查不到的值回退到词表标签。
  const moodId = playlist.preferences.mood;
  const moodText =
    MOOD_PRESETS.find((m) => m.id === moodId)?.label ?? moodLabel(moodId);

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="relative"
    >
      <PaperCard rotation={-1} className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-start justify-between">
          <span className="handwritten text-2xl text-brown">{formatMMDD(playlist.createdAt)}</span>
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="flex h-8 w-8 items-center justify-center rounded-full text-brown/85 transition-colors hover:text-brick"
              aria-label="删除这个歌单"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>

        <p className="text-base font-semibold text-ink">{playlist.name}</p>

        <div className="flex flex-wrap items-center gap-1.5 text-xs text-brown">
          {scene ? (
            <span className="inline-flex items-center gap-1">
              <SceneIcon id={scene.id} size={14} />
              {scene.label}
            </span>
          ) : null}
          {moodText ? (
            <span className="inline-flex items-center gap-1">
              <MoodIcon id={moodId ?? ""} size={14} />
              {moodText}
            </span>
          ) : null}
          <span className="text-brown">· {playlist.songs.length} 首</span>
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
