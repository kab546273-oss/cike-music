// ============================================================
// lib/llm/schema.ts — Zod schema for structured music preferences
// produced by the LLM. Validates the JSON object returned by
// the model before it is handed to the recommendation engine.
// ============================================================

import { z } from "zod";

/** Vocal level vocabulary shared with types/index.ts */
export const VocalLevelSchema = z.enum(["none", "low", "medium", "high"]);

/**
 * MusicPreferencesSchema — the shape the LLM is instructed to emit.
 * scene / mood are free-form string|null (LLM may not be certain).
 * bpm_min / bpm_max are numeric BPM bounds.
 * exclude_style is a list of style tags the user explicitly dislikes.
 * confidence is the model's own 0~1 calibration of its parse.
 */
/**
 * Normalize exclude_style: LLM may return a comma-separated string
 * instead of an array. Split on Chinese/English commas and trim.
 */
const ExcludeStyleSchema = z.preprocess(
  (val) => {
    if (typeof val === "string") {
      return val.split(/[,，、]/).map((s) => s.trim()).filter(Boolean);
    }
    return val;
  },
  z.array(z.string())
);

export const MusicPreferencesSchema = z.object({
  scene: z.string().nullable(),
  mood: z.string().nullable(),
  bpm_min: z.number(),
  bpm_max: z.number(),
  vocal: VocalLevelSchema,
  exclude_style: ExcludeStyleSchema,
  confidence: z.number().min(0).max(1),
});

export type ParsedMusicPreferences = z.infer<typeof MusicPreferencesSchema>;
