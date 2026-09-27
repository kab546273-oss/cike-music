// ============================================================
// lib/recommendation/scoring.ts — Per-dimension scoring functions
// and tunable scene/mood configuration. All functions are pure
// and React-free; this module is consumed by the recommendation
// pipeline and the feedback module.
// ============================================================

import { normalizeStyleTag } from "@/lib/constants";
import type { MusicPreferences, Song, VocalLevel } from "@/types";

// ---------- Scene → preferred style weights ----------
// Listed styles get their explicit weight; unlisted styles fall
// back to STYLE_DEFAULT_WEIGHT. Weights are in [0, 1].
//
// ⚠️ 表里只能出现 lib/constants.ts → CATALOG_STYLES 中的标签。
// 旧版本用的是 lo-fi / chillhop / ambient / classical / lullaby /
// bossa —— 这些标签在 data/music.json 里一首歌都没有，导致
// 自习 / 备考 / 撸猫场景只有 5% 的歌能在风格维度拿到区分度，
// 风格权重被静默浪费。改表后请跑 `npm run audit:vocab` 校验对齐。

export const STYLE_DEFAULT_WEIGHT = 0.2;

export const SCENE_STYLE_WEIGHTS: Record<string, Record<string, number>> = {
  study: {
    "new-age": 1.0, chill: 0.9, "indie-folk": 0.9, acoustic: 0.85,
    cinematic: 0.8, modal: 0.75, jazz: 0.7, "neo-soul": 0.7,
    soul: 0.7, bebop: 0.6, electronic: 0.6, swing: 0.6, folk: 0.55,
  },
  work: {
    "neo-soul": 1.0, jazz: 0.9, electronic: 0.9, chill: 0.85,
    funk: 0.8, "synth-pop": 0.8, indie: 0.75, "indie-pop": 0.7,
    alternative: 0.7, modal: 0.7, soul: 0.7,
  },
  exam: {
    "new-age": 1.0, cinematic: 0.9, acoustic: 0.85, "indie-folk": 0.85,
    modal: 0.8, chill: 0.8, jazz: 0.7, bebop: 0.65, swing: 0.6,
    folk: 0.55,
  },
  reading: {
    acoustic: 1.0, jazz: 0.95, folk: 0.9, "indie-folk": 0.9,
    "neo-soul": 0.85, soul: 0.85, chill: 0.85, modal: 0.8,
    "new-age": 0.8, jangle: 0.75, cinematic: 0.7, swing: 0.7, bebop: 0.7,
  },
  commute: {
    "indie-pop": 1.0, "pop-vocal": 0.95, rnb: 0.9, indie: 0.85,
    "synth-pop": 0.85, alternative: 0.8, britpop: 0.75, funk: 0.75,
    "neo-soul": 0.75,
  },
  walk: {
    indie: 1.0, "indie-pop": 0.95, folk: 0.95, jangle: 0.9,
    "indie-rock": 0.85, acoustic: 0.85, britpop: 0.8, alternative: 0.75,
    "synth-pop": 0.75,
  },
  running: {
    edm: 1.0, dance: 0.95, rock: 0.95, "dance-punk": 0.9,
    hiphop: 0.85, "pop-vocal": 0.85, electronic: 0.85, disco: 0.85,
    funk: 0.8, trap: 0.8, cinematic: 0.7,
  },
  fitness: {
    edm: 1.0, hiphop: 0.95, dance: 0.95, rock: 0.95, trap: 0.9,
    "dance-punk": 0.85, "pop-vocal": 0.85, electronic: 0.85, funk: 0.8,
    "synth-pop": 0.7,
  },
  cycling: {
    edm: 1.0, dance: 0.95, "synth-pop": 0.9, "pop-vocal": 0.9,
    indie: 0.85, rock: 0.85, disco: 0.85, electronic: 0.8, funk: 0.8,
    "indie-pop": 0.8,
  },
  afternoon: {
    jazz: 1.0, "neo-soul": 0.95, soul: 0.9, acoustic: 0.9, chill: 0.85,
    rnb: 0.8, funk: 0.8, indie: 0.75, "indie-pop": 0.75, folk: 0.75,
    modal: 0.75, swing: 0.7,
  },
  tipsy: {
    jazz: 1.0, rnb: 0.95, "neo-soul": 0.95, soul: 0.9,
    "pop-vocal": 0.85, indie: 0.8, cinematic: 0.75, funk: 0.75,
    swing: 0.7, "synth-pop": 0.7,
  },
  cat: {
    acoustic: 1.0, "new-age": 0.95, "indie-folk": 0.9, jangle: 0.85,
    folk: 0.8, chill: 0.8, soul: 0.8, "neo-soul": 0.75, jazz: 0.7,
    swing: 0.7, cinematic: 0.7,
  },
  travel: {
    indie: 1.0, "indie-pop": 0.95, folk: 0.95, "pop-vocal": 0.85,
    "indie-rock": 0.8, cinematic: 0.8, britpop: 0.75, "j-pop": 0.75,
    alternative: 0.75,
  },
  shopping: {
    "pop-vocal": 1.0, dance: 0.95, disco: 0.9, "synth-pop": 0.9,
    edm: 0.85, "indie-pop": 0.85, rnb: 0.8, funk: 0.8, "j-pop": 0.8,
    "dance-punk": 0.75,
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
//
// ⚠️ 必须覆盖 CATALOG_MOODS 里的全部 26 个心情，以及 relaxed /
// lazy / focused 这三个"纯偏好值"（曲库里没有对应歌曲，只能靠
// 相关心情兜底）。旧表只覆盖了 15 个键，nostalgic / intense /
// fun / dark / hopeful / groovy / epic / cool / mischievous /
// dramatic / self-conscious / resigned / satirical / quirky
// 全都落不到 0.5，直接从 1.0 掉到 0.2。

export const MOOD_RELATIONS: Record<string, string[]> = {
  calm: ["relaxed", "chill", "healing", "lazy", "warm", "focused", "resigned", "self-conscious"],
  chill: ["relaxed", "calm", "lazy", "warm", "healing", "free", "cool", "groovy"],
  cool: ["chill", "free", "groovy"],
  dark: ["melancholy", "intense", "dramatic", "epic"],
  dramatic: ["epic", "intense", "melancholy", "dark"],
  energetic: ["happy", "motivational", "free", "intense", "fun"],
  epic: ["intense", "dramatic", "motivational"],
  focused: ["calm", "chill", "self-conscious"],
  free: ["energetic", "happy", "chill", "cool"],
  fun: ["happy", "energetic", "groovy", "mischievous", "quirky"],
  groovy: ["fun", "chill", "energetic"],
  happy: ["energetic", "motivational", "free", "warm", "fun"],
  healing: ["calm", "warm", "relaxed", "chill", "hopeful"],
  hopeful: ["healing", "warm", "motivational"],
  intense: ["energetic", "dark", "epic", "dramatic"],
  lazy: ["chill", "relaxed", "warm", "calm"],
  lonely: ["sad", "melancholy", "calm", "self-conscious"],
  melancholy: ["sad", "lonely", "calm", "nostalgic", "dramatic"],
  mischievous: ["fun", "quirky", "happy"],
  motivational: ["energetic", "happy", "hopeful"],
  nostalgic: ["warm", "melancholy", "sad", "chill"],
  quirky: ["fun", "mischievous", "happy"],
  relaxed: ["chill", "calm", "lazy", "healing", "warm"],
  resigned: ["calm", "melancholy", "sad"],
  romantic: ["warm", "chill", "healing", "nostalgic"],
  sad: ["lonely", "melancholy", "calm", "resigned"],
  satirical: ["quirky", "fun"],
  "self-conscious": ["melancholy", "calm", "lonely"],
  warm: ["healing", "romantic", "chill", "lazy", "nostalgic", "hopeful"],
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

/**
 * Max over the song's styles of the scene's preferred weight.
 * Every tag goes through STYLE_ALIASES first, so a legacy tag
 * (lo-fi / chillhop / ambient …) or a re-labelled song still
 * scores against the catalog vocabulary instead of silently
 * falling back to STYLE_DEFAULT_WEIGHT.
 */
export function scoreStyle(song: Song, scene: string | null): number {
  if (!scene) return 0.5;
  const table = SCENE_STYLE_WEIGHTS[scene];
  if (!table) return 0.5;
  let best = STYLE_DEFAULT_WEIGHT;
  for (const raw of song.style) {
    for (const style of normalizeStyleTag(raw)) {
      const w = table[style];
      if (typeof w === "number" && w > best) best = w;
    }
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
