// ============================================================
// lib/recommendation/scoring.ts — Per-dimension scoring functions
// and tunable scene/mood configuration. All functions are pure
// and React-free; this module is consumed by the recommendation
// pipeline and the feedback module.
// ============================================================

import type { MusicPreferences, Song, VocalLevel } from "@/types";

// ---------- Scene → preferred style weights ----------
// Listed styles get their explicit weight; unlisted styles fall
// back to STYLE_DEFAULT_WEIGHT. Weights are in [0, 1].

export const STYLE_DEFAULT_WEIGHT = 0.2;

export const SCENE_STYLE_WEIGHTS: Record<string, Record<string, number>> = {
  study: {
    "lo-fi": 1.0, chillhop: 0.9, ambient: 0.9, "new-age": 0.8,
    classical: 0.7, acoustic: 0.6, lullaby: 0.5,
  },
  work: {
    chillhop: 1.0, "lo-fi": 0.9, ambient: 0.8, jazz: 0.7,
    indie: 0.6, "indie-pop": 0.6, bossa: 0.5,
  },
  exam: {
    classical: 1.0, ambient: 0.9, "new-age": 0.9, "lo-fi": 0.8,
    acoustic: 0.6, lullaby: 0.5,
  },
  reading: {
    "lo-fi": 1.0, chillhop: 0.9, acoustic: 0.9, ambient: 0.9,
    "new-age": 0.8, classical: 0.8, jazz: 0.7, bossa: 0.7,
  },
  commute: {
    "indie-pop": 1.0, "pop-vocal": 0.9, rnb: 0.8, indie: 0.8,
    chillhop: 0.7, "lo-fi": 0.6,
  },
  walk: {
    indie: 1.0, "indie-pop": 0.9, folk: 0.9, bossa: 0.8,
    chillhop: 0.7, "lo-fi": 0.6,
  },
  running: {
    edm: 1.0, dance: 0.9, rock: 0.9, hiphop: 0.8,
    "pop-vocal": 0.8, cinematic: 0.7,
  },
  fitness: {
    edm: 1.0, dance: 0.9, rock: 0.9, hiphop: 0.9,
    "pop-vocal": 0.8, cinematic: 0.7,
  },
  cycling: {
    edm: 1.0, dance: 0.9, "pop-vocal": 0.8, rock: 0.8, indie: 0.7,
  },
  afternoon: {
    bossa: 1.0, jazz: 0.9, "lo-fi": 0.9, chillhop: 0.9,
    acoustic: 0.8, indie: 0.7, "new-age": 0.6,
  },
  tipsy: {
    jazz: 1.0, bossa: 0.9, rnb: 0.9, "pop-vocal": 0.8,
    indie: 0.7, cinematic: 0.6,
  },
  cat: {
    acoustic: 1.0, lullaby: 0.9, "new-age": 0.9, ambient: 0.9,
    "lo-fi": 0.8, classical: 0.7,
  },
  travel: {
    indie: 1.0, "indie-pop": 0.9, folk: 0.9, "pop-vocal": 0.8,
    cinematic: 0.7, bossa: 0.7,
  },
  shopping: {
    "pop-vocal": 1.0, dance: 0.9, edm: 0.8, "indie-pop": 0.8, rnb: 0.7,
  },
};

// ---------- Scene → dimension weights ----------
// Must sum to 1.0 per scene. High-motion scenes weight BPM;
// quiet scenes weight mood + vocal.

export interface DimensionWeights {
  bpm: number;
  vocal: number;
  style: number;
  mood: number;
  history: number;
}

export const DEFAULT_WEIGHTS: DimensionWeights = {
  bpm: 0.25, vocal: 0.15, style: 0.25, mood: 0.25, history: 0.10,
};

export const SCENE_WEIGHTS: Record<string, DimensionWeights> = {
  study:    { bpm: 0.15, vocal: 0.25, style: 0.20, mood: 0.30, history: 0.10 },
  work:     { bpm: 0.20, vocal: 0.20, style: 0.20, mood: 0.30, history: 0.10 },
  exam:     { bpm: 0.15, vocal: 0.25, style: 0.20, mood: 0.30, history: 0.10 },
  reading:  { bpm: 0.15, vocal: 0.25, style: 0.25, mood: 0.25, history: 0.10 },
  commute:  { bpm: 0.25, vocal: 0.15, style: 0.25, mood: 0.25, history: 0.10 },
  walk:     { bpm: 0.25, vocal: 0.15, style: 0.25, mood: 0.25, history: 0.10 },
  running:  { bpm: 0.40, vocal: 0.15, style: 0.20, mood: 0.15, history: 0.10 },
  fitness:  { bpm: 0.40, vocal: 0.15, style: 0.20, mood: 0.15, history: 0.10 },
  cycling:  { bpm: 0.35, vocal: 0.15, style: 0.20, mood: 0.20, history: 0.10 },
  afternoon:{ bpm: 0.15, vocal: 0.25, style: 0.25, mood: 0.25, history: 0.10 },
  tipsy:    { bpm: 0.20, vocal: 0.20, style: 0.25, mood: 0.25, history: 0.10 },
  cat:      { bpm: 0.15, vocal: 0.25, style: 0.25, mood: 0.25, history: 0.10 },
  travel:   { bpm: 0.25, vocal: 0.15, style: 0.25, mood: 0.25, history: 0.10 },
  shopping: { bpm: 0.30, vocal: 0.15, style: 0.25, mood: 0.20, history: 0.10 },
};

export function getWeights(scene: string | null): DimensionWeights {
  if (!scene) return DEFAULT_WEIGHTS;
  return SCENE_WEIGHTS[scene] ?? DEFAULT_WEIGHTS;
}

// ---------- Mood relations ----------
// "Related" moods score 0.5 on the mood dimension when the
// requested mood is not directly present on a song.

export const MOOD_RELATIONS: Record<string, string[]> = {
  calm: ["relaxed", "chill", "healing", "lazy", "warm", "focused"],
  chill: ["relaxed", "calm", "lazy", "warm", "healing", "free"],
  energetic: ["happy", "motivational", "free"],
  focused: ["calm", "chill"],
  free: ["energetic", "happy", "chill"],
  happy: ["energetic", "motivational", "free", "warm"],
  healing: ["calm", "warm", "relaxed", "chill"],
  lazy: ["chill", "relaxed", "warm", "calm"],
  motivational: ["energetic", "happy"],
  romantic: ["warm", "chill", "healing"],
  warm: ["healing", "romantic", "chill", "lazy"],
  relaxed: ["chill", "calm", "lazy", "healing"],
  sad: ["lonely", "melancholy", "calm"],
  lonely: ["sad", "melancholy", "calm"],
  melancholy: ["sad", "lonely", "calm"],
};

// ---------- Vocal ordering for distance scoring ----------

const VOCAL_ORDER: Record<VocalLevel, number> = {
  none: 0, low: 1, medium: 2, high: 3,
};

// ---------- Scoring functions (each returns 0..1) ----------

/** Gaussian decay around the BPM midpoint; sigma = 0.4 * range width. */
export function scoreBpm(songBpm: number, bpmMin: number, bpmMax: number): number {
  const width = Math.max(bpmMax - bpmMin, 1);
  const mid = (bpmMin + bpmMax) / 2;
  const sigma = 0.4 * width;
  const d = songBpm - mid;
  return Math.exp(-(d * d) / (2 * sigma * sigma));
}

/** Vocal level distance: exact=1.0, adjacent=0.6, gap-2=0.3, opposite=0.1. */
export function scoreVocal(songLevel: VocalLevel, preferred: VocalLevel): number {
  const dist = Math.abs(VOCAL_ORDER[songLevel] - VOCAL_ORDER[preferred]);
  if (dist === 0) return 1.0;
  if (dist === 1) return 0.6;
  if (dist === 2) return 0.3;
  return 0.1;
}

/** Max over the song's styles of the scene's preferred weight. */
export function scoreStyle(song: Song, scene: string | null): number {
  if (!scene) return 0.5;
  const table = SCENE_STYLE_WEIGHTS[scene];
  if (!table) return 0.5;
  let best = STYLE_DEFAULT_WEIGHT;
  for (const s of song.style) {
    const w = table[s];
    if (typeof w === "number" && w > best) best = w;
  }
  return best;
}

/** Direct mood match = 1.0, related = 0.5, otherwise 0.2; null mood = neutral 0.5. */
export function scoreMood(song: Song, preferredMood: string | null): number {
  if (!preferredMood) return 0.5;
  if (song.mood.includes(preferredMood)) return 1.0;
  const related = MOOD_RELATIONS[preferredMood];
  if (related && related.some((m) => song.mood.includes(m))) return 0.5;
  return 0.2;
}

/** History penalty: 0.0 if recently played, else 1.0. */
export function scoreHistory(songId: string, history: string[] | undefined): number {
  if (!history) return 1.0;
  return history.includes(songId) ? 0.0 : 1.0;
}

/** Weighted total across all five dimensions. */
export function scoreSong(
  song: Song,
  prefs: MusicPreferences,
  history: string[] | undefined,
): number {
  const w = getWeights(prefs.scene);
  return (
    scoreBpm(song.bpm, prefs.bpm_min, prefs.bpm_max) * w.bpm +
    scoreVocal(song.vocal_level, prefs.vocal) * w.vocal +
    scoreStyle(song, prefs.scene) * w.style +
    scoreMood(song, prefs.mood) * w.mood +
    scoreHistory(song.id, history) * w.history
  );
}
