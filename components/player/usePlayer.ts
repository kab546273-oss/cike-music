"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Song } from "@/types";

interface UsePlayerOptions {
  /** fired once a track has been played through ≥70% (used to reset skip counter) */
  onCompletePlay?: () => void;
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
    const song = playlistRef.current[latestIndexRef.current];
    if (manual && song) onSkipRef.current?.(song);
    setIndex((i) => {
      const n = i + 1;
      if (n >= playlistRef.current.length) {
        setIsPlaying(false);
        return i;
      }
      return n;
    });
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
      onCompletePlayRef.current?.();
    }
    if (currentTime >= duration) {
      setIndex((i) => {
        const n = i + 1;
        if (n >= playlistRef.current.length) {
          setIsPlaying(false);
          return i;
        }
        return n;
      });
      setCurrentTime(0);
      notifiedRef.current = false;
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
