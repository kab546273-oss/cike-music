import type { Playlist } from "@/types";

const KEY = "cike_music_playlists";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Save (insert) a playlist. Silently fails when localStorage is unavailable. */
export function savePlaylist(playlist: Playlist): void {
  if (!isBrowser()) return;
  try {
    const all = getPlaylists();
    const idx = all.findIndex((p) => p.id === playlist.id);
    if (idx >= 0) {
      all[idx] = playlist;
    } else {
      all.unshift(playlist);
    }
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable / quota exceeded — ignore */
  }
}

/** Read all saved playlists, newest first. Never throws. */
export function getPlaylists(): Playlist[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is Playlist =>
        typeof p === "object" &&
        p !== null &&
        typeof (p as Playlist).id === "string" &&
        Array.isArray((p as Playlist).songs)
    );
  } catch {
    return [];
  }
}

/** Find a single playlist by id. */
export function getPlaylistById(id: string): Playlist | null {
  return getPlaylists().find((p) => p.id === id) ?? null;
}

/** Delete a playlist by id. */
export function deletePlaylist(id: string): void {
  if (!isBrowser()) return;
  try {
    const all = getPlaylists().filter((p) => p.id !== id);
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}
