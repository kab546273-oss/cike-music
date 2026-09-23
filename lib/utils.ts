import type { MusicPreferences } from "@/types";

/** Tiny class-name combiner (no clsx dependency needed). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Format seconds as mm:ss. */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Deterministic string hash (FNV-1a-ish). */
function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

/**
 * Design-system palette used for deterministic placeholder covers.
 * All picks are deep/saturated enough that white cover letters stay
 * readable and the cover never blends into the paper background.
 */
const PALETTE = [
  "#84906B", // olive
  "#B86F5E", // brick
  "#6B5745", // brown
  "#302B27", // ink
  "#5A6B4E", // deep olive
  "#9C5A48", // deep brick
  "#4A3F35", // warm dark
  "#7A6B55", // muted tan
];

/**
 * Generate a deterministic CSS linear gradient from a seed string.
 * Picks two palette colors based on the hash so the same song always
 * gets the same cover.
 */
export function generateGradient(seed: string): string {
  const hash = hashString(seed || "cike");
  const colorA = PALETTE[hash % PALETTE.length];
  const colorB = PALETTE[(hash >> 3) % PALETTE.length];
  const angle = 120 + (hash % 60);
  return `linear-gradient(${angle}deg, ${colorA}, ${colorB})`;
}

/** Encode preferences into a URL-safe base64 string. */
export function encodePreferences(prefs: MusicPreferences): string {
  const json = JSON.stringify(prefs);
  let base: string;
  if (typeof window === "undefined") {
    // Node-side fallback (Buffer) — keeps SSR happy if ever called there.
    base = Buffer.from(json, "utf-8").toString("base64");
  } else {
    const bytes = new TextEncoder().encode(json);
    base = window.btoa(String.fromCharCode(...bytes));
  }
  return encodeURIComponent(base);
}

/** Decode a base64 URL param back into preferences. Returns null on failure. */
export function decodePreferences(str: string | null | undefined): MusicPreferences | null {
  if (!str) return null;
  try {
    const decoded = decodeURIComponent(str);
    let json: string;
    if (typeof window === "undefined") {
      json = Buffer.from(decoded, "base64").toString("utf-8");
    } else {
      const bytes = Uint8Array.from(window.atob(decoded), (c) => c.charCodeAt(0));
      json = new TextDecoder().decode(bytes);
    }
    const parsed = JSON.parse(json) as Partial<MusicPreferences>;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.bpm_min !== "number" ||
      typeof parsed.bpm_max !== "number"
    ) {
      return null;
    }
    return {
      scene: typeof parsed.scene === "string" ? parsed.scene : null,
      mood: typeof parsed.mood === "string" ? parsed.mood : null,
      bpm_min: parsed.bpm_min,
      bpm_max: parsed.bpm_max,
      vocal: (["none", "low", "medium", "high"] as const).includes(
        parsed.vocal as "none" | "low" | "medium" | "high"
      )
        ? (parsed.vocal as MusicPreferences["vocal"])
        : "medium",
      exclude_style: Array.isArray(parsed.exclude_style)
        ? parsed.exclude_style.filter((s): s is string => typeof s === "string")
        : [],
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.8,
    };
  } catch {
    return null;
  }
}
