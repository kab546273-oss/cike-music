// ============================================================
// lib/llm/schema.ts — Zod schema for structured music preferences
// produced by the LLM. Validates the JSON object returned by
// the model before it is handed to the recommendation engine.
// ============================================================

import { z } from "zod";
import {
  normalizeMood,
  normalizeScene,
  normalizeStyleList,
  normalizeVocal,
} from "@/lib/constants";
import type { MusicPreferences } from "@/types";

/** Vocal level vocabulary shared with types/index.ts */
export const VocalLevelSchema = z.enum(["none", "low", "medium", "high"]);

// ---------- Tolerant field parsers ----------
// Why: the previous version only normalized exclude_style. A model that
// answered `"bpm_min": "72"`, `"vocal": "medium "` or `"confidence": "0.9"`
// failed the whole parse, and the user silently lost the LLM path even
// though the intent had been understood correctly. Every field is now
// normalized or defaulted; only genuinely unusable numbers fail.

/** Fallbacks used when the model omits a field entirely. */
const DEFAULT_VOCAL = "medium" as const;
const DEFAULT_CONFIDENCE = 0.7;
const DEFAULT_BPM_MIN = 60;
const DEFAULT_BPM_MAX = 120;
const BPM_FLOOR = 30;
const BPM_CEILING = 260;

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

/** "72" / "72 BPM" / 72.4 → 72; blank → the supplied default. */
function bpmSchema(fallback: number) {
  return z.preprocess(
    (val) => {
      if (isBlank(val)) return fallback;
      if (typeof val === "number") return Number.isFinite(val) ? Math.round(val) : val;
      if (typeof val === "string") {
        const n = Number(val.replace(/[^\d.-]/g, ""));
        return Number.isFinite(n) ? Math.round(n) : val;
      }
      return val;
    },
    z
      .number()
      .transform((n) => Math.min(BPM_CEILING, Math.max(BPM_FLOOR, Math.round(n)))),
  );
}

/**
 * vocal — accepts "medium ", "中人声", "instrumental"… Anything we
 * cannot recognize degrades to "medium" (82% of the catalog) instead
 * of failing the parse.
 */
const VocalInputSchema = z.preprocess(
  (val) => normalizeVocal(val) ?? DEFAULT_VOCAL,
  VocalLevelSchema,
);

/** confidence — accepts "0.9", clamps into 0~1, defaults to 0.7. */
const ConfidenceSchema = z.preprocess(
  (val) => {
    if (isBlank(val)) return DEFAULT_CONFIDENCE;
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const n = Number(val.trim());
      return Number.isFinite(n) ? n : val;
    }
    return val;
  },
  z.number().transform((n) => Math.min(1, Math.max(0, n))),
);

/**
 * scene / mood — normalized onto the app vocabulary. Chinese values
 * ("自习") and English synonyms map to their ids; anything unknown
 * becomes null so it can never silently miss the weight and label
 * tables while still validating.
 */
const SceneSchema = z.preprocess((val) => normalizeScene(val), z.string().nullable());
const MoodSchema = z.preprocess((val) => normalizeMood(val), z.string().nullable());

/**
 * exclude_style — accepts a comma-separated string, then maps every
 * tag onto the catalog vocabulary (lo-fi → chill / electronic …).
 */
const ExcludeStyleSchema = z.preprocess(
  (val) => normalizeStyleList(val),
  z.array(z.string()),
);

/**
 * MusicPreferencesSchema — the shape the LLM is instructed to emit,
 * and the validator for every preferences payload that enters the
 * API (parse route, recommend route, feedback route).
 */
export const MusicPreferencesSchema = z.object({
  scene: SceneSchema,
  mood: MoodSchema,
  bpm_min: bpmSchema(DEFAULT_BPM_MIN),
  bpm_max: bpmSchema(DEFAULT_BPM_MAX),
  vocal: VocalInputSchema,
  exclude_style: ExcludeStyleSchema,
  confidence: ConfidenceSchema,
});

export type ParsedMusicPreferences = z.infer<typeof MusicPreferencesSchema>;

/** Turn validated input into the canonical MusicPreferences shape. */
function toPreferences(parsed: ParsedMusicPreferences): MusicPreferences {
  return {
    scene: parsed.scene,
    mood: parsed.mood,
    bpm_min: Math.min(parsed.bpm_min, parsed.bpm_max),
    bpm_max: Math.max(parsed.bpm_min, parsed.bpm_max),
    vocal: parsed.vocal,
    exclude_style: parsed.exclude_style,
    confidence: parsed.confidence,
  };
}

/**
 * Parse + normalize an untrusted payload into MusicPreferences:
 * BPM bounds ordered, style tags mapped onto the catalog vocabulary.
 * Throws (ZodError) when the payload is genuinely unusable.
 */
export function normalizePreferences(input: unknown): MusicPreferences {
  return toPreferences(MusicPreferencesSchema.parse(input));
}
