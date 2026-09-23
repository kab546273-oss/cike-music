// ============================================================
// app/api/parse/route.ts — Natural language → structured
// music preferences via LLM. Any failure degrades to a generic
// PARSE_FAILED so the frontend can show the scene-picker fallback.
// ============================================================

import { NextResponse } from "next/server";
import { z } from "zod";
import { parseIntent } from "@/lib/llm/parseIntent";

const BodySchema = z.object({
  text: z.string().trim().min(1).max(500),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { text } = BodySchema.parse(body);
    const { preferences, confidence } = await parseIntent(text);
    return NextResponse.json({ success: true, preferences, confidence });
  } catch {
    // Do not leak LLM/stack details to the client.
    return NextResponse.json({ success: false, error: "PARSE_FAILED" });
  }
}
