import type { AnalyticsEvent, AnalyticsEventType } from "@/types";

const FLUSH_INTERVAL_MS = 5000;
const MAX_QUEUE = 10;

let queue: AnalyticsEvent[] = [];
let timer: ReturnType<typeof setInterval> | null = null;
let flushed = false;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

async function sendEvents(events: AnalyticsEvent[]): Promise<void> {
  if (events.length === 0) return;
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events }),
    });
  } catch {
    /* network/backend unavailable — drop silently for demo */
  }
}

/** Flush the pending queue to the server. */
export function flushEvents(): void {
  if (!isBrowser()) return;
  if (queue.length === 0) return;
  const pending = queue;
  queue = [];
  void sendEvents(pending);
}

/** Track an analytics event. Events are batched and POSTed to /api/events. */
export function trackEvent(
  type: AnalyticsEventType,
  payload?: Record<string, unknown>
): void {
  if (!isBrowser()) return;

  const event: AnalyticsEvent = {
    type,
    timestamp: Date.now(),
    payload,
  };

  // Demo visibility in console — 只打事件名，payload 可能含用户输入。
  console.log(`[analytics] ${type}`);

  queue.push(event);

  if (!flushed) {
    flushed = true;
    timer = setInterval(flushEvents, FLUSH_INTERVAL_MS);
    window.addEventListener("beforeunload", flushEvents);
    window.addEventListener("pagehide", flushEvents);
  }

  if (queue.length >= MAX_QUEUE) {
    flushEvents();
  }
}

/** Stop the interval (used for tests / cleanup). */
export function stopAnalytics(): void {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
  if (isBrowser()) {
    window.removeEventListener("beforeunload", flushEvents);
    window.removeEventListener("pagehide", flushEvents);
  }
}
