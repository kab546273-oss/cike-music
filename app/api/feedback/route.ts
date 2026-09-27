// ============================================================
// app/api/feedback/route.ts — Negative feedback handler.
// Adjusts preferences from skipped songs and either regenerates
// a fresh playlist or asks the user to re-describe their taste
// once the regeneration cap is hit.
// ============================================================

import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizePreferences } from "@/lib/llm/schema";
import { calculateFeedback } from "@/lib/feedback";
import { recommend } from "@/lib/recommendation";

const SkippedSongSchema = z.object({
  id: z.string(),
  style: z.array(z.string()),
  mood: z.array(z.string()),
  artist: z.string().optional(),
  album: z.string().optional(),
});

const BodySchema = z.object({
  preferences: z.unknown(),
  skippedSongs: z.array(SkippedSongSchema).default([]),
  regenerationCount: z.number().int().nonnegative(),
  /** Song ids already played — keeps the regenerated list from repeating them. */
  history: z.array(z.string()).max(500).optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { preferences, skippedSongs, regenerationCount, history } =
      BodySchema.parse(body);
    const currentPreferences = normalizePreferences(preferences);

    const outcome = calculateFeedback(
      currentPreferences,
      skippedSongs,
      regenerationCount,
    );

    if (!outcome.shouldRegenerate) {
      return NextResponse.json({
        success: true,
        shouldRegenerate: false,
        maxReached: outcome.maxReached ?? true,
        regenerationCount,
        message: outcome.message,
      });
    }

    if (!outcome.adjustedPreferences || outcome.regenerationCount == null) {
      return NextResponse.json({ success: false, error: "FEEDBACK_FAILED" });
    }

    const result = recommend(outcome.adjustedPreferences, {
      regenerationCount: outcome.regenerationCount,
      history,
    });

    return NextResponse.json({
      success: true,
      shouldRegenerate: true,
      adjustedPreferences: outcome.adjustedPreferences,
      songs: result.songs,
      context: result.context,
      regenerationCount: outcome.regenerationCount,
    });
  } catch (err) {
    console.error(
      "[api/feedback] FEEDBACK_FAILED",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json({ success: false, error: "FEEDBACK_FAILED" });
  }
}
