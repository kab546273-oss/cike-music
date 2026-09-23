// ============================================================
// lib/recommendation/index.ts — Top-level recommendation pipeline:
// hard filter → soft score → sort → diversity pick → context.
// This module is server-only and must not import React.
// ============================================================

import { getAllSongs } from "@/lib/data";
import { scoreSong } from "./scoring";
import { applyDiversity } from "./diversity";
import { SCENE_LABEL_MAP, MOOD_VALUE_TO_LABEL, VOCAL_LABEL } from "@/lib/constants";
import type {
  MusicPreferences,
  RecommendationContext,
  RecommendationResult,
  Song,
} from "@/types";

export interface RecommendOptions {
  /** Song ids already played this session — penalized to zero. */
  history?: string[];
  /** How many regeneration rounds have already happened (surfaced in context). */
  regenerationCount?: number;
}

/**
 * Hard filter: drop songs that are not cleared for playback,
 * that fall outside the BPM band, or that carry an excluded style.
 */
function hardFilter(songs: Song[], prefs: MusicPreferences): Song[] {
  const excluded = new Set(prefs.exclude_style ?? []);
  return songs.filter((song) => {
    if (!song.has_copyright) return false;
    if (song.bpm < prefs.bpm_min || song.bpm > prefs.bpm_max) return false;
    if (excluded.size > 0 && song.style.some((s) => excluded.has(s))) return false;
    return true;
  });
}

/** Build the human-readable Chinese reason string for the context. */
function buildReason(prefs: MusicPreferences): string {
  const sceneLabel = prefs.scene ? (SCENE_LABEL_MAP[prefs.scene] ?? prefs.scene) : "随心";
  const moodLabel = prefs.mood ? (MOOD_VALUE_TO_LABEL[prefs.mood] ?? prefs.mood) : "无特定";
  const vocalLabel = VOCAL_LABEL[prefs.vocal] ?? prefs.vocal;
  return `这批歌是根据你的${sceneLabel} / ${moodLabel} / ${vocalLabel} / ${prefs.bpm_min}–${prefs.bpm_max} BPM 找到的。`;
}

/**
 * Produce a top-10 playlist for the given preferences.
 * If hard filtering yields no candidates, fall back to relaxing
 * the BPM band so the user never gets an empty result.
 */
export function recommend(
  prefs: MusicPreferences,
  options: RecommendOptions = {},
): RecommendationResult {
  const all = getAllSongs();
  const history = options.history;
  const regenerationCount = options.regenerationCount ?? 0;

  let candidates = hardFilter(all, prefs);

  // Safety net: if the band is too tight, widen BPM by 50% on each side.
  if (candidates.length === 0) {
    const width = Math.max(prefs.bpm_max - prefs.bpm_min, 1);
    const relaxed: MusicPreferences = {
      ...prefs,
      bpm_min: Math.max(0, prefs.bpm_min - width * 0.5),
      bpm_max: prefs.bpm_max + width * 0.5,
    };
    candidates = hardFilter(all, relaxed);
  }

  const scored = candidates
    .map((song) => ({ song, score: scoreSong(song, prefs, history) }))
    .sort((a, b) => b.score - a.score);

  const picked = applyDiversity(scored.map((s) => s.song));

  const context: RecommendationContext = {
    scene: prefs.scene,
    mood: prefs.mood,
    bpmRange: `${prefs.bpm_min}-${prefs.bpm_max}`,
    vocal: prefs.vocal,
    exclude_style: prefs.exclude_style ?? [],
    regenerationCount,
    reason: buildReason(prefs),
  };

  return { songs: picked, context };
}
