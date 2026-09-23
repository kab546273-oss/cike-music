// ============================================================
// lib/data.ts — Server-side data access layer
// Reads data/music.json and exposes typed song records.
// This module must only be imported by server code (API routes,
// recommendation engine). Never import from a client component.
// ============================================================

import musicData from "@/data/music.json";
import type { Song } from "@/types";

/**
 * Return all songs in the catalog as strongly typed Song[].
 * The JSON file is bundled at build time via resolveJsonModule.
 */
export function getAllSongs(): Song[] {
  return musicData as Song[];
}
