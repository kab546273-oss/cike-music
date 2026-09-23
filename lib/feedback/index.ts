// ============================================================
// lib/feedback/index.ts — Negative feedback adjustment.
// When the user skips songs, we tighten the preferences:
// expand exclude_style, narrow the BPM band, and (if the rejected
// songs shared the requested mood) shift to a related mood.
// Caps at two regeneration rounds before asking the user to
// re-describe their taste.
// ============================================================

import { MOOD_RELATIONS } from "@/lib/recommendation/scoring";
import type { MusicPreferences } from "@/types";

/** Minimal shape needed from a skipped song (structurally compatible with Song). */
export interface SkippedSongInfo {
  style: string[];
  mood: string[];
}

export const MAX_REGENERATIONS = 2;
export const FEEDBACK_CONFIDENCE = 0.85;
export const REGENERATION_MESSAGE = "我们换个描述试试，也许会更接近你。";

export interface FeedbackOutcome {
  shouldRegenerate: boolean;
  maxReached?: boolean;
  message?: string;
  adjustedPreferences?: MusicPreferences;
  regenerationCount?: number;
}

/**
 * Merge original exclude_style with every style tag seen on the
 * skipped songs (de-duplicated, order-preserving).
 */
function mergeExcludeStyle(original: string[], skipped: SkippedSongInfo[]): string[] {
  const set = new Set(original);
  for (const song of skipped) {
    for (const s of song.style) set.add(s);
  }
  return Array.from(set);
}

/**
 * Narrow the BPM band by 25% around its midpoint. Each side moves
 * 12.5% of the original width toward the midpoint. Guarantees
 * min < max.
 */
function narrowBpm(min: number, max: number): { bpm_min: number; bpm_max: number } {
  const width = Math.max(max - min, 1);
  const mid = (min + max) / 2;
  const shrink = width * 0.125;
  let newMin = Math.round((min + shrink) * 10) / 10;
  let newMax = Math.round((max - shrink) * 10) / 10;
  if (newMax - newMin < 1) {
    newMin = Math.floor(mid - 1);
    newMax = Math.ceil(mid + 1);
  }
  return { bpm_min: newMin, bpm_max: newMax };
}

/**
 * If the skipped songs all share the originally requested mood,
 * move to the first related mood that is different from it.
 */
function shiftMood(originalMood: string | null, skipped: SkippedSongInfo[]): string | null {
  if (!originalMood) return null;
  const rejectedShareMood = skipped.some((s) => s.mood.includes(originalMood));
  if (!rejectedShareMood) return originalMood;

  const related = MOOD_RELATIONS[originalMood];
  if (!related || related.length === 0) return originalMood;
  const next = related.find((m) => m !== originalMood);
  return next ?? originalMood;
}

/**
 * Compute the next-step preferences given skipped songs.
 */
export function calculateFeedback(
  preferences: MusicPreferences,
  skippedSongs: SkippedSongInfo[],
  regenerationCount: number,
): FeedbackOutcome {
  if (regenerationCount >= MAX_REGENERATIONS) {
    return {
      shouldRegenerate: false,
      maxReached: true,
      message: REGENERATION_MESSAGE,
    };
  }

  const bpm = narrowBpm(preferences.bpm_min, preferences.bpm_max);
  const adjustedPreferences: MusicPreferences = {
    scene: preferences.scene,
    mood: shiftMood(preferences.mood, skippedSongs),
    bpm_min: bpm.bpm_min,
    bpm_max: bpm.bpm_max,
    vocal: preferences.vocal,
    exclude_style: mergeExcludeStyle(preferences.exclude_style ?? [], skippedSongs),
    confidence: FEEDBACK_CONFIDENCE,
  };

  return {
    shouldRegenerate: true,
    adjustedPreferences,
    regenerationCount: regenerationCount + 1,
  };
}
