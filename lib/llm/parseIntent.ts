// ============================================================
// lib/llm/parseIntent.ts — Orchestrates the LLM call, extracts
// JSON from the raw response, validates against the Zod schema,
// and enforces a minimum confidence threshold. All errors
// propagate to the route handler which degrades to the
// scene-picker fallback.
// ============================================================

import { callLLM, LLMParseError } from "./client";
import { MusicPreferencesSchema, type ParsedMusicPreferences } from "./schema";
import type { MusicPreferences } from "@/types";

/** Thrown when the LLM's own confidence is below the configured floor. */
export class LowConfidenceError extends Error {
  readonly confidence: number;
  constructor(confidence: number) {
    super(`LLM confidence ${confidence} below threshold`);
    this.name = "LowConfidenceError";
    this.confidence = confidence;
  }
}

const DEFAULT_MIN_CONFIDENCE = 0.5;

/**
 * Try to parse a raw LLM content string into a JSON object.
 * First attempt direct parse; on failure, extract the substring
 * from the first "{" to the last "}" and retry.
 */
function extractJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new LLMParseError("No JSON object found in LLM output");
    }
    const slice = raw.slice(start, end + 1);
    try {
      return JSON.parse(slice);
    } catch {
      throw new LLMParseError("Extracted substring is not valid JSON");
    }
  }
}

export interface ParseIntentResult {
  preferences: MusicPreferences;
  confidence: number;
}

/**
 * End-to-end intent parsing: call LLM → extract JSON → validate →
 * enforce confidence floor. Re-throws on any failure.
 */
export async function parseIntent(text: string): Promise<ParseIntentResult> {
  const raw = await callLLM(text);
  const json = extractJson(raw);
  const parsed: ParsedMusicPreferences = MusicPreferencesSchema.parse(json);

  const minConfidenceRaw = Number(process.env.LLM_MIN_CONFIDENCE ?? DEFAULT_MIN_CONFIDENCE);
  const minConfidence = Number.isFinite(minConfidenceRaw) ? minConfidenceRaw : DEFAULT_MIN_CONFIDENCE;

  if (parsed.confidence < minConfidence) {
    throw new LowConfidenceError(parsed.confidence);
  }

  // Normalize bpm bounds so min <= max regardless of LLM ordering.
  const bpm_min = Math.min(parsed.bpm_min, parsed.bpm_max);
  const bpm_max = Math.max(parsed.bpm_min, parsed.bpm_max);

  const preferences: MusicPreferences = {
    scene: parsed.scene,
    mood: parsed.mood,
    bpm_min,
    bpm_max,
    vocal: parsed.vocal,
    exclude_style: parsed.exclude_style ?? [],
    confidence: parsed.confidence,
  };

  return { preferences, confidence: parsed.confidence };
}
