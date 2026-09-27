"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Playlist } from "@/types";
import { deletePlaylist, getPlaylists } from "@/lib/storage";
import { encodePreferences } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import Navbar from "@/components/layout/Navbar";
import PlaylistCard from "@/components/music/PlaylistCard";

export default function LibraryPage() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // read from localStorage (external store) on mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlaylists(getPlaylists());
    setHydrated(true);
  }, []);

  const handlePlay = (playlist: Playlist) => {
    trackEvent("playlist_replay", {
      playlistId: playlist.id,
      count: playlist.songs.length,
    });
    // 带上 id：歌单页会按 id 取回保存的那批曲子原样播放，
    // 而不是用 preferences 重新生成一份"看起来差不多"的歌单。
    router.push(
      `/playlist?p=${encodePreferences(playlist.preferences)}&id=${encodeURIComponent(playlist.id)}`
    );
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("要删除这一刻吗？删除后无法恢复。")) return;
    deletePlaylist(id);
    setPlaylists(getPlaylists());
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24">
        <section className="pt-10 text-center">
          <h1 className="handwritten text-5xl text-ink">My Music Journal</h1>
          <p className="mt-2 text-brown">记录那些值得再次听见的时刻。</p>
        </section>

        {hydrated && playlists.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-brown">还没有保存的歌单，去首页创造你的第一个音乐时刻吧。</p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-brick px-5 py-2.5 text-sm font-semibold text-paper-light transition-transform hover:scale-[1.03]"
            >
              去创造此刻 <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <motion.div layout className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {playlists.map((playlist) => (
              <motion.div
                key={playlist.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
              >
                <PlaylistCard
                  playlist={playlist}
                  onPlay={() => handlePlay(playlist)}
                  onDelete={() => handleDelete(playlist.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
