"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Song } from "@/types";

interface UsePlayerOptions {
  /** fired once a track has been played through ≥70% (used to reset skip counter) */
  onCompletePlay?: (song: Song) => void;
  /** fired when the user explicitly skips the current track */
  onSkip?: (song: Song) => void;
}

interface PlayerState {
  currentSong: Song | null;
  playlist: Song[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  /** 0 ~ 1 */
  progress: number;
}

/**
 * Simulated playback: no real audio file, a 500ms timer advances time.
 */
export function usePlayer(options: UsePlayerOptions = {}) {
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [index, setIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const notifiedRef = useRef(false);
  const playlistRef = useRef<Song[]>([]);
  const latestIndexRef = useRef(index);
  const onCompletePlayRef = useRef(options.onCompletePlay);
  const onSkipRef = useRef(options.onSkip);

  // mirror latest values into refs (inside effects, never during render)
  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);
  useEffect(() => {
    latestIndexRef.current = index;
  }, [index]);
  useEffect(() => {
    onCompletePlayRef.current = options.onCompletePlay;
    onSkipRef.current = options.onSkip;
  });

  const currentSong = index >= 0 && index < playlist.length ? playlist[index] : null;
  const duration = currentSong?.duration ?? 0;
  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  /** Load a list and start playing from a given index. */
  const loadPlaylist = useCallback((songs: Song[], startIndex = 0) => {
    setPlaylist(songs);
    playlistRef.current = songs;
    setIndex(startIndex);
    setCurrentTime(0);
    notifiedRef.current = false;
    setIsPlaying(songs.length > 0);
  }, []);

  /** Play a specific song by object (must already be in the loaded list). */
  const playSong = useCallback((song: Song) => {
    const found = playlistRef.current.findIndex((s) => s.id === song.id);
    const target = found >= 0 ? found : 0;
    setIndex(target);
    setCurrentTime(0);
    notifiedRef.current = false;
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const next = useCallback((manual = false) => {
    // Read from refs instead of inside a setState updater: updaters must
    // stay pure (React double-invokes them in StrictMode, which used to
    // fire setIsPlaying twice per skip).
    const list = playlistRef.current;
    const song = list[latestIndexRef.current];
    if (manual && song) onSkipRef.current?.(song);

    const n = latestIndexRef.current + 1;
    if (n >= list.length) {
      setIsPlaying(false);
      setCurrentTime(0);
      notifiedRef.current = false;
      return;
    }
    setIndex(n);
    setCurrentTime(0);
    notifiedRef.current = false;
  }, []);

  const prev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
    setCurrentTime(0);
    notifiedRef.current = false;
    setIsPlaying(true);
  }, []);

  const seek = useCallback((time: number) => {
    setCurrentTime(Math.max(0, time));
  }, []);

  // mirror index into a ref for stable callbacks
  // (declared above next to avoid use-before-declaration)

  // ticking clock
  useEffect(() => {
    if (!isPlaying || !currentSong) return;
    const id = setInterval(() => {
      setCurrentTime((t) => t + 0.5);
    }, 500);
    return () => clearInterval(id);
  }, [isPlaying, currentSong]);

  // completion / auto-next detection
  useEffect(() => {
    if (!currentSong || duration <= 0) return;
    if (!notifiedRef.current && currentTime / duration >= 0.7) {
      notifiedRef.current = true;
      onCompletePlayRef.current?.(currentSong);
    }
    if (currentTime >= duration) {
      const n = latestIndexRef.current + 1;
      // 由 500ms 计时器驱动的状态迁移（曲终 → 下一首），不是级联渲染。
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentTime(0);
      notifiedRef.current = false;
      if (n >= playlistRef.current.length) {
        setIsPlaying(false);
      } else {
        setIndex(n);
      }
    }
  }, [currentTime, currentSong, duration]);

  const state: PlayerState = {
    currentSong,
    playlist,
    isPlaying,
    currentTime,
    duration,
    progress,
  };

  return { state, loadPlaylist, playSong, togglePlay, next, prev, seek };
}
