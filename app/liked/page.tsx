"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Heart, Play } from "lucide-react";
import type { Song } from "@/types";
import { moodLabel, styleLabel } from "@/lib/constants";
import { formatTime } from "@/lib/utils";
import { getLikedSongs, toggleLikeSong } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";
import Navbar from "@/components/layout/Navbar";
import SongCover from "@/components/music/SongCover";

/**
 * 我喜欢 — 从「我的歌单」里独立出来的单曲收藏。
 * 播放直接复用歌单页已有的虚拟歌单（/playlist?id=__liked__），
 * 所以这里只做「列表 + 播放全部 + 取消收藏」。
 */
export default function LikedPage() {
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // 从 localStorage 这个外部存储读一次
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSongs(getLikedSongs());
    setHydrated(true);
  }, []);

  const totalSeconds = songs.reduce((sum, song) => sum + (song.duration || 0), 0);

  const playAll = () => {
    trackEvent("playlist_replay", {
      playlistId: "__liked__",
      count: songs.length,
    });
    router.push("/playlist?id=__liked__");
  };

  const unlike = (song: Song) => {
    toggleLikeSong(song);
    setSongs(getLikedSongs());
    trackEvent("song_like", { songId: song.id, liked: false });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24">
        <section className="pt-10 text-center">
          <h1 className="handwritten text-5xl text-ink">我喜欢</h1>
          <p className="mt-2 text-brown">
            {hydrated && songs.length > 0
              ? `收藏起来的 ${songs.length} 首 · 共 ${formatTime(totalSeconds)}`
              : "把喜欢的那几首收在这里"}
          </p>
        </section>

        {hydrated && songs.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-brown">
              还没有收藏的歌。在歌单里点一下 ♡，它就会出现在这里。
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-brick px-5 py-2.5 text-sm font-semibold text-paper-light transition-transform hover:scale-[1.03]"
            >
              去找一首 <ArrowRight size={15} />
            </Link>
          </div>
        ) : null}

        {songs.length > 0 ? (
          <>
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={playAll}
                className="inline-flex items-center gap-2 rounded-md bg-brick px-5 py-2.5 text-sm font-semibold text-paper-light transition-transform hover:scale-[1.03]"
              >
                <Play size={15} fill="currentColor" /> 播放全部
              </button>
            </div>

            <motion.ul layout className="mt-8 flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {songs.map((song, i) => (
                  <motion.li
                    key={song.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  >
                    <div className="paper-card flex items-center gap-3 rounded-md p-3">
                      <span className="handwritten w-7 shrink-0 text-center text-2xl leading-none text-brown">
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <button
                        type="button"
                        onClick={playAll}
                        className="shrink-0 rounded-full bg-paper-dark p-2 text-ink transition-colors hover:bg-olive hover:text-paper-light"
                        aria-label={`播放 ${song.title}`}
                      >
                        <Play size={16} className="translate-x-[1px]" />
                      </button>

                      <SongCover song={song} size={48} index={i} />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{song.title}</p>
                        <p className="truncate text-xs text-brown">{song.artist}</p>
                        <p className="mt-0.5 truncate text-xs tracking-wide text-brown">
                          {song.bpm} BPM · {styleLabel(song.style[0])} · {moodLabel(song.mood[0])} ·{" "}
                          {formatTime(song.duration)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => unlike(song)}
                        className="shrink-0 rounded-full p-2 text-brick transition-colors hover:text-ink"
                        aria-label={`取消收藏 ${song.title}`}
                        title="取消收藏"
                      >
                        <Heart size={16} fill="currentColor" />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          </>
        ) : null}
      </main>
    </div>
  );
}
