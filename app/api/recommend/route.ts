// ============================================================
// app/api/recommend/route.ts — Run the recommendation engine
// against structured preferences and return a top-10 playlist
// plus explanatory context.
// ============================================================

import { NextResponse } from "next/server";
import { z } from "zod";
import { MusicPreferencesSchema } from "@/lib/llm/schema";
import { recommend } from "@/lib/recommendation";

const BodySchema = z.object({
  preferences: MusicPreferencesSchema,
  history: z.array(z.string()).optional(),
  regenerationCount: z.number().int().nonnegative().optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { preferences, history, regenerationCount } = BodySchema.parse(body);
    const result = recommend(preferences, { history, regenerationCount });
    return NextResponse.json({
      success: true,
      songs: result.songs,
      context: result.context,
    });
  } catch {
    return NextResponse.json({ success: false, error: "RECOMMEND_FAILED" });
  }
}
