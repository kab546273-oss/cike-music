// ============================================================
// app/api/feedback/route.ts — Negative feedback handler.
// Adjusts preferences from skipped songs and either regenerates
// a fresh playlist or asks the user to re-describe their taste
// once the regeneration cap is hit.
// ============================================================

import { NextResponse } from "next/server";
import { z } from "zod";
import { MusicPreferencesSchema } from "@/lib/llm/schema";
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
  preferences: MusicPreferencesSchema,
  skippedSongs: z.array(SkippedSongSchema).default([]),
  regenerationCount: z.number().int().nonnegative(),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { preferences, skippedSongs, regenerationCount } = BodySchema.parse(body);

    const outcome = calculateFeedback(preferences, skippedSongs, regenerationCount);

    if (!outcome.shouldRegenerate) {
      return NextResponse.json({
        success: true,
        shouldRegenerate: false,
        maxReached: outcome.maxReached ?? true,
        message: outcome.message,
      });
    }

    if (!outcome.adjustedPreferences || outcome.regenerationCount == null) {
      return NextResponse.json({ success: false, error: "FEEDBACK_FAILED" });
    }

    const result = recommend(outcome.adjustedPreferences, {
      regenerationCount: outcome.regenerationCount,
    });

    return NextResponse.json({
      success: true,
      shouldRegenerate: true,
      adjustedPreferences: outcome.adjustedPreferences,
      songs: result.songs,
      context: result.context,
      regenerationCount: outcome.regenerationCount,
    });
  } catch {
    return NextResponse.json({ success: false, error: "FEEDBACK_FAILED" });
  }
}
