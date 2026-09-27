// ============================================================
// app/api/events/route.ts — Demo analytics sink.
// Accepts a batch of events and logs them server-side. In a
// production build this would forward to a real pipeline.
// ============================================================

import { NextResponse } from "next/server";
import { z } from "zod";

const EventSchema = z.object({
  type: z.string(),
  timestamp: z.number(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

const BodySchema = z.object({
  events: z.array(EventSchema).default([]),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { events } = BodySchema.parse(body);
    for (const event of events) {
      // Demo visibility — one line per event, event name only.
      // (payload 可能包含用户输入原文，不写进服务端日志。)
      console.log(`[analytics] ${event.type}`);
    }
    return NextResponse.json({ success: true, recorded: events.length });
  } catch {
    console.error("[api/events] rejected a batch of analytics events");
    return NextResponse.json({ success: false, recorded: 0 });
  }
}
