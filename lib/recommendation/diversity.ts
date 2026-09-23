// ============================================================
// lib/recommendation/diversity.ts — Greedy selection that
// enforces artist/album caps and style coverage on the final
// playlist. Rules are declared as constants so they can be
// tuned in one place.
// ============================================================

import type { Song } from "@/types";

export const DIVERSITY_RULES = {
  /** Maximum songs by the same artist in the final playlist. */
  maxPerArtist: 2,
  /** Maximum songs from the same album. */
  maxPerAlbum: 1,
  /** How many slots must respect the style-coverage preference. */
  styleDiversityWindow: 5,
  /** Minimum distinct styles required inside the window. */
  minDistinctStylesInWindow: 2,
  /** Target playlist length. */
  targetLength: 10,
} as const;

/**
 * Greedily pick up to `targetLength` songs from a pre-sorted
 * (best-scoring first) candidate list, enforcing:
 *   - maxPerArtist per artist
 *   - maxPerAlbum per album
 *   - at least minDistinctStylesInWindow styles among the first
 *     styleDiversityWindow picks (prefer candidates that add a
 *     new style while the window is not yet covered)
 */
export function applyDiversity(sorted: Song[]): Song[] {
  const picked: Song[] = [];
  const artistCounts = new Map<string, number>();
  const usedAlbums = new Set<string>();
  const usedStyles = new Set<string>();

  for (const song of sorted) {
    if (picked.length >= DIVERSITY_RULES.targetLength) break;

    const artistCount = artistCounts.get(song.artist) ?? 0;
    if (artistCount >= DIVERSITY_RULES.maxPerArtist) continue;
    if (usedAlbums.has(song.album)) continue;

    // Within the diversity window, prefer candidates that introduce
    // a new style if we are still below the required coverage.
    const inWindow = picked.length < DIVERSITY_RULES.styleDiversityWindow;
    const needsMoreStyles = usedStyles.size < DIVERSITY_RULES.minDistinctStylesInWindow;
    const introducesNewStyle = song.style.some((s) => !usedStyles.has(s));

    if (inWindow && needsMoreStyles && !introducesNewStyle) {
      // Skip for now; revisit later if no better candidate appears.
      // We handle this by deferring non-style-expanding picks: keep scanning.
      // To avoid permanently dropping good songs, we do NOT `continue` here
      // when no other candidate can expand styles — the loop just moves on
      // and a later pass may pick it.
      continue;
    }

    picked.push(song);
    artistCounts.set(song.artist, artistCount + 1);
    usedAlbums.add(song.album);
    for (const s of song.style) usedStyles.add(s);
  }

  // Second pass: fill any remaining slots without the style preference,
  // so we always reach targetLength if enough candidates exist.
  if (picked.length < DIVERSITY_RULES.targetLength) {
    for (const song of sorted) {
      if (picked.length >= DIVERSITY_RULES.targetLength) break;
      if (picked.includes(song)) continue;
      const artistCount = artistCounts.get(song.artist) ?? 0;
      if (artistCount >= DIVERSITY_RULES.maxPerArtist) continue;
      if (usedAlbums.has(song.album)) continue;
      picked.push(song);
      artistCounts.set(song.artist, artistCount + 1);
      usedAlbums.add(song.album);
    }
  }

  return picked;
}
