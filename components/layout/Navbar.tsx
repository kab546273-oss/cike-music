"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLikedSongs } from "@/lib/storage";
import Tape from "@/components/scrapbook/Tape";

const LINKS = [
  { href: "/", label: "此刻" },
  { href: "/library", label: "我的歌单" },
  { href: "/liked", label: "我喜欢" },
];

/** 手绘下划线：hover / 键盘聚焦时像用笔从左画到右，当前页保持实线。 */
function DoodleUnderline() {
  return (
    <svg
      className="doodle-underline pointer-events-none absolute inset-x-0 -bottom-1 w-full"
      viewBox="0 0 100 8"
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
    >
      <path d="M2,5 C20,2 35,6.5 52,4 C68,1.5 82,5.5 98,3.5" pathLength={100} />
    </svg>
  );
}

/**
 * Top navigation bar — 纸质便签 logo + 手绘下划线页签。
 * logo 默认微微倾斜，hover / 聚焦时"被拿起来"，让用户一眼知道能点。
 */
export default function Navbar() {
  const pathname = usePathname();
  const [likedCount, setLikedCount] = useState(0);

  // 收藏数来自 localStorage（外部存储）；在别处点赞时由
  // cike:liked-changed 事件触发刷新，避免数字停留在旧值。
  useEffect(() => {
    const sync = () => setLikedCount(getLikedSongs().length);
    sync();
    window.addEventListener("cike:liked-changed", sync);
    return () => window.removeEventListener("cike:liked-changed", sync);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-paper-dark bg-bg/85 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
        <Link
          href="/"
          title="回到此刻（首页）"
          aria-label="回到此刻（首页）"
          className="logo-sticker paper-card inline-block shrink-0 rounded-md px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/50"
        >
          {/* 胶带 pointer-events-none，不会挡住点击 */}
          <Tape
            rotation={-3}
            color="rgba(228,199,120,0.62)"
            className="logo-tape"
            style={{ top: -9, left: "50%", marginLeft: -30, width: 60, height: 18 }}
          />
          <span className="handwritten text-2xl leading-none text-ink sm:text-3xl">
            此刻音乐
          </span>
          <span className="hidden pl-2 text-xs tracking-wide text-brown lg:inline">
            A MUSIC JOURNAL
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            const isLiked = link.href === "/liked";
            return (
              <Link
                key={link.href}
                href={link.href}
                data-active={active}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "nav-tab relative inline-flex items-center gap-1 rounded-sm px-2 py-1.5 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/50",
                  active ? "text-ink" : "text-brown hover:text-ink"
                )}
              >
                {isLiked ? (
                  <Heart
                    size={13}
                    className="shrink-0"
                    fill={active ? "currentColor" : "none"}
                  />
                ) : null}
                {link.label}
                {isLiked && likedCount > 0 ? (
                  <span className="hidden rounded-full bg-paper-dark px-1.5 text-xs font-semibold text-brown sm:inline-block">
                    {likedCount}
                  </span>
                ) : null}
                <DoodleUnderline />
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
