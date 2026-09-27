// ============================================================
// lib/recommendation/index.ts — Top-level recommendation pipeline:
// hard filter → soft score → sort → diversity pick → context.
// This module is server-only and must not import React.
// ============================================================

import { getAllSongs } from "@/lib/data";
import { scoreSong } from "./scoring";
import { applyDiversity, DIVERSITY_RULES } from "./diversity";
import {
  SCENE_LABEL_MAP,
  MOOD_VALUE_TO_LABEL,
  VOCAL_LABEL,
  normalizeStyleList,
  normalizeStyleTag,
} from "@/lib/constants";
import type {
  MusicPreferences,
  RecommendationContext,
  RecommendationRelaxation,
  RecommendationResult,
  Song,
  VocalLevel,
} from "@/types";

export interface RecommendOptions {
  /** Song ids already played this session — penalized to zero. */
  history?: string[];
  /** Song ids to hard-exclude (e.g. "换一批" should not repeat the current batch). */
  excludeIds?: string[];
  /** How many regeneration rounds have already happened (surfaced in context). */
  regenerationCount?: number;
}

/**
 * When the requested vocal level cannot be satisfied at all, step
 * one notch toward the middle of the catalog instead of silently
 * returning the opposite. (The catalog currently has 0 songs with
 * vocal_level "high", and its 7 instrumental tracks are all
 * 120 BPM+, so `vocal: "none"` on a quiet scene is unsatisfiable.)
 */
const VOCAL_FALLBACK: Partial<Record<VocalLevel, VocalLevel>> = {
  none: "low",
  high: "medium",
};

/**
 * Hard filter: drop songs that are not cleared for playback,
 * that fall outside the BPM band, or that carry an excluded style.
 * Excluded tags are normalized to the catalog vocabulary first, so
 * "lo-fi" also excludes its catalog equivalents (chill / electronic).
 */
function hardFilter(songs: Song[], prefs: MusicPreferences): Song[] {
  const excluded = new Set(normalizeStyleList(prefs.exclude_style));
  return songs.filter((song) => {
    if (!song.has_copyright) return false;
    if (song.bpm < prefs.bpm_min || song.bpm > prefs.bpm_max) return false;
    if (excluded.size > 0) {
      const hit = song.style.some((tag) =>
        normalizeStyleTag(tag).some((style) => excluded.has(style)),
      );
      if (hit) return false;
    }
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
 *
 * Every relaxation the engine applies is recorded in
 * `context.relaxations` so the UI can tell the user *what it gave
 * up on* instead of silently returning something else. Relaxation
 * order: vocal level → BPM band → excluded styles.
 */
export function recommend(
  prefs: MusicPreferences,
  options: RecommendOptions = {},
): RecommendationResult {
  const all = getAllSongs();
  const history = options.history;
  const excludeIds = new Set(options.excludeIds ?? []);
  const regenerationCount = options.regenerationCount ?? 0;
  const target = DIVERSITY_RULES.targetLength;
  const relaxations: RecommendationRelaxation[] = [];

  const requestedVocal = prefs.vocal;
  const excludeStyle = normalizeStyleList(prefs.exclude_style);

  // 1) Vocal level — only relax when the catalog cannot satisfy it
  //    anywhere inside the requested BPM band.
  let vocal: VocalLevel = requestedVocal;
  const vocalAvailable = (level: VocalLevel): boolean =>
    all.some(
      (song) =>
        song.vocal_level === level &&
        song.bpm >= prefs.bpm_min &&
        song.bpm <= prefs.bpm_max,
    );
  const vocalFallback = VOCAL_FALLBACK[requestedVocal];
  if (vocalFallback && !vocalAvailable(requestedVocal)) {
    vocal = vocalFallback;
    relaxations.push({
      dimension: "vocal",
      message: `曲库里「${VOCAL_LABEL[requestedVocal]}」的曲目在这个节奏区间暂时没有，这一批放宽到了「${VOCAL_LABEL[vocalFallback]}」。`,
    });
  }

  let bpmMin = prefs.bpm_min;
  let bpmMax = prefs.bpm_max;
  let scoredPrefs: MusicPreferences = {
    ...prefs,
    bpm_min: bpmMin,
    bpm_max: bpmMax,
    vocal,
    exclude_style: excludeStyle,
  };

  let candidates = hardFilter(all, scoredPrefs);

  // 1b) Hard-exclude songs the user already saw in the current batch
  //     (used by "换一批" so the new batch doesn't repeat the old one).
  if (excludeIds.size > 0) {
    candidates = candidates.filter((s) => !excludeIds.has(s.id));
  }

  // 2) BPM band — widen by 50% of the width on each side.
  if (candidates.length < target) {
    const width = Math.max(prefs.bpm_max - prefs.bpm_min, 1);
    const wideMin = Math.round(prefs.bpm_min - width * 0.5);
    const wideMax = Math.round(prefs.bpm_max + width * 0.5);
    const widePrefs: MusicPreferences = {
      ...scoredPrefs,
      bpm_min: wideMin,
      bpm_max: wideMax,
    };
    const wideCandidates = hardFilter(all, widePrefs);
    if (wideCandidates.length > candidates.length) {
      bpmMin = wideMin;
      bpmMax = wideMax;
      candidates = wideCandidates;
      scoredPrefs = widePrefs;
      relaxations.push({
        dimension: "bpm",
        message: `${prefs.bpm_min}–${prefs.bpm_max} BPM 内凑不满 ${target} 首，已放宽到 ${bpmMin}–${bpmMax} BPM。`,
      });
    }
  }

  // 3) Excluded styles — only as a last resort to avoid a short list.
  if (candidates.length < target && scoredPrefs.exclude_style.length > 0) {
    const noExcludePrefs: MusicPreferences = {
      ...scoredPrefs,
      exclude_style: [],
    };
    const moreCandidates = hardFilter(all, noExcludePrefs);
    if (moreCandidates.length > candidates.length) {
      candidates = moreCandidates;
      relaxations.push({
        dimension: "style",
        message: `避开这些风格后凑不满 ${target} 首，这一批没有强制排除。`,
      });
    }
  }

  // 4) 仍然是空结果时，说清是哪一条条件把曲库掏空了。
  //    旧版这种情况会返回一个沉默的空歌单，用户不知道能改什么。
  if (candidates.length === 0) {
    const playable = all.filter((song) => song.has_copyright);
    const catalogBpm = playable.map((song) => song.bpm);
    const catalogMin = Math.min(...catalogBpm);
    const catalogMax = Math.max(...catalogBpm);
    const inRequestedBand = playable.filter(
      (song) => song.bpm >= prefs.bpm_min && song.bpm <= prefs.bpm_max,
    );
    const inWideBand = playable.filter(
      (song) => song.bpm >= bpmMin && song.bpm <= bpmMax,
    );

    if (inRequestedBand.length === 0) {
      relaxations.push({
        dimension: "bpm",
        message: `曲库里没有 ${prefs.bpm_min}–${prefs.bpm_max} BPM 的曲子（现有曲目在 ${catalogMin}–${catalogMax} BPM），换个节奏区间我再试。`,
      });
    } else {
      relaxations.push({
        dimension: "style",
        message: `这个节奏区间里有 ${inWideBand.length} 首可播放的曲子，但都没能通过当前的筛选条件，把条件放松一点我再试。`,
      });
    }
  }

  const scored = candidates
    .map((song) => ({ song, score: scoreSong(song, scoredPrefs, history) }))
    .sort((a, b) => b.score - a.score);

  const picked = applyDiversity(scored.map((s) => s.song));

  const context: RecommendationContext = {
    scene: prefs.scene,
    mood: prefs.mood,
    bpmRange: `${bpmMin}-${bpmMax}`,
    vocal,
    exclude_style: scoredPrefs.exclude_style,
    regenerationCount,
    reason: buildReason(scoredPrefs),
    catalogSize: all.length,
    relaxations,
  };

  return { songs: picked, context };
}
