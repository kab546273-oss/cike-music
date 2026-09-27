// ============================================================
// app/api/parse/route.ts — Natural language → structured
// music preferences via LLM. Any failure degrades to a generic
// PARSE_FAILED so the frontend can show the scene-picker fallback.
// ============================================================

import { NextResponse } from "next/server";
import { z } from "zod";
import { LowConfidenceError, parseIntent } from "@/lib/llm/parseIntent";
import { LLMAPIError, LLMParseError, LLMTimeoutError } from "@/lib/llm/client";
import type { ParseFailureReason } from "@/types";

const BodySchema = z.object({
  text: z.string().trim().min(1).max(500),
});

/**
 * Map a failure onto a machine-readable reason.
 *
 * The previous version collapsed every error into PARSE_FAILED and
 * logged nothing, so an expired API key, a timeout and a schema
 * mismatch were indistinguishable — both to the user and in the
 * server logs.
 */
function classify(err: unknown): ParseFailureReason {
  if (err instanceof z.ZodError) return "BAD_REQUEST";
  if (err instanceof LLMTimeoutError) return "LLM_TIMEOUT";
  if (err instanceof LowConfidenceError) return "LOW_CONFIDENCE";
  if (err instanceof LLMParseError) return "INVALID_OUTPUT";
  if (err instanceof LLMAPIError) {
    const status = err.status ?? 0;
    if (status === 401 || status === 403 || status === 0) return "LLM_NOT_CONFIGURED";
    return "LLM_API_ERROR";
  }
  return "UNKNOWN";
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { text } = BodySchema.parse(body);
    const { preferences, confidence } = await parseIntent(text);
    return NextResponse.json({ success: true, preferences, confidence });
  } catch (err) {
    const reason = classify(err);
    // Server-side visibility (the client only gets the reason code —
    // never the key, the stack, or the raw model output).
    console.error(
      `[api/parse] ${reason}`,
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json({ success: false, error: "PARSE_FAILED", reason });
  }
}
