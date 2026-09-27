import type { Playlist, Song } from "@/types";

const KEY = "cike_music_playlists";
const HISTORY_KEY = "cike_music_history";
const LIKED_KEY = "cike_music_liked";
/** How many recently played song ids to keep on the device. */
export const HISTORY_LIMIT = 200;

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

// ---------- 最近播放 ----------
// 推荐引擎的第五个维度（history 惩罚）需要真实的历史记录才能生效。
// 旧版歌单页永远发送 history: []，这一维恒为常数、等于没实现。

/** Read the recently played song ids, newest first. Never throws. */
export function getPlayHistory(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

/** Append song ids to the play history (newest first, de-duplicated, capped). */
export function addToPlayHistory(ids: string[]): string[] {
  const clean = ids.filter((id) => typeof id === "string" && id.length > 0);
  if (clean.length === 0) return getPlayHistory();
  const next = [...clean, ...getPlayHistory().filter((id) => !clean.includes(id))];
  const capped = next.slice(0, HISTORY_LIMIT);
  if (isBrowser()) {
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(capped));
    } catch {
      /* storage unavailable / quota exceeded — ignore */
    }
  }
  return capped;
}

/** Clear the play history. */
export function clearPlayHistory(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* ignore */
  }
}

// ---------- 我喜欢 ----------

/** Read all liked songs, newest first. Never throws. */
export function getLikedSongs(): Song[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(LIKED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s): s is Song =>
        typeof s === "object" &&
        s !== null &&
        typeof (s as Song).id === "string" &&
        typeof (s as Song).title === "string"
    );
  } catch {
    return [];
  }
}

/** Whether a song has been liked. */
export function isLiked(songId: string): boolean {
  return getLikedSongs().some((s) => s.id === songId);
}

/**
 * Toggle a song's liked state. Returns the new liked status.
 * Liked songs are stored newest-first; unliking removes them.
 */
export function toggleLikeSong(song: Song): boolean {
  const all = getLikedSongs();
  const idx = all.findIndex((s) => s.id === song.id);
  if (idx >= 0) {
    all.splice(idx, 1);
    writeLiked(all);
    return false;
  }
  all.unshift(song);
  writeLiked(all);
  return true;
}

function writeLiked(songs: Song[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(LIKED_KEY, JSON.stringify(songs));
  } catch {
    /* quota exceeded — ignore */
  }
  // 通知监听者（导航栏的收藏计数）立即刷新
  window.dispatchEvent(new Event("cike:liked-changed"));
}

// ---------- 无损角标解锁 ----------
// 会话级状态（不写 localStorage），方便 demo 反复演示：
// 刷新页面后角标重新隐藏，再点一次「无损」按钮又会浮现。

let losslessUnlocked = false;

export function isLosslessUnlocked(): boolean {
  return losslessUnlocked;
}

export function unlockLossless(): void {
  losslessUnlocked = true;
}
