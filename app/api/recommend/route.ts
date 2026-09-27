// ============================================================
// app/api/recommend/route.ts — Run the recommendation engine
// against structured preferences and return a top-10 playlist
// plus explanatory context.
// ============================================================

import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizePreferences } from "@/lib/llm/schema";
import { recommend } from "@/lib/recommendation";

const BodySchema = z.object({
  preferences: z.unknown(),
  /** Song ids already played — penalized by the history dimension. */
  history: z.array(z.string()).max(500).optional(),
  /** Song ids to hard-exclude (e.g. "换一批"). */
  excludeIds: z.array(z.string()).max(500).optional(),
  regenerationCount: z.number().int().nonnegative().optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { preferences, history, excludeIds, regenerationCount } = BodySchema.parse(body);
    // normalizePreferences coerces LLM/URL values and maps style tags
    // onto the catalog vocabulary before the engine sees them.
    const result = recommend(normalizePreferences(preferences), {
      history,
      excludeIds,
      regenerationCount,
    });
    return NextResponse.json({
      success: true,
      songs: result.songs,
      context: result.context,
    });
  } catch (err) {
    console.error(
      "[api/recommend] RECOMMEND_FAILED",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json({ success: false, error: "RECOMMEND_FAILED" });
  }
}
