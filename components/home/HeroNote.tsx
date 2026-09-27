"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import {
  DoodleCassette,
  DoodleHeadphones,
  DoodleNote,
  DoodleVinyl,
} from "@/components/scrapbook/Doodles";
import Tape from "@/components/scrapbook/Tape";

/**
 * 首屏开场（方案 B）：便签 + 音乐拼贴 + 标题"被写出来"。
 *
 * - 标题逐字揭示（每字 0.06s 的 clip-path mask），一支"笔尖"随写随移，写完淡出；
 * - 四张涂鸦贴纸用站内现成图形（Doodles.tsx），鼠标移动时有轻微视差；
 * - 左上角可撕纸角，点开是三步用法说明；
 * - thinking 时整个便签内容换成"正在理解这一刻…"，
 *   翻页到歌单页后由 AIThinking 接着演，视觉上像同一张纸翻过去。
 */

const TITLE_SEGMENTS = [
  { text: "此刻的你，", tone: "ink" as const },
  { text: "想听什么？", tone: "brick" as const },
];

const TITLE_CHARS = TITLE_SEGMENTS.flatMap((segment) =>
  [...segment.text].map((char) => ({ char, tone: segment.tone })),
);

/**
 * 方案 A｜逐字落笔：
 * 每个字用 0.16s 写完，字与字间隔 0.2s —— 多出来的 0.04s 是抬笔，
 * 所以同一时刻只有一个字在变化，"笔走到哪"和"字写到哪"永远是一件事。
 */
const CHAR_WRITE_S = 0.16;
const CHAR_STEP_S = 0.2;
/** 整行写完的总时长（= 笔尖横向走完的时间） */
const WRITE_DURATION = TITLE_CHARS.length * CHAR_STEP_S;

/**
 * 笔尖的水平缓动：每个 0.2s 周期里先横向走完一个字（占 80%），
 * 剩下 20% 停在原地（视觉上就是抬笔的那一下）。
 */
function penStepEase(t: number): number {
  const n = TITLE_CHARS.length;
  const scaled = t * n;
  const idx = Math.min(n - 1, Math.floor(scaled));
  const local = scaled - idx;
  const writeRatio = CHAR_WRITE_S / CHAR_STEP_S;
  return (idx + Math.min(1, local / writeRatio)) / n;
}

/** 手绘旋律线（拼贴与"正在理解"两处共用） */
const MELODY_PATH =
  "M4,18 C60,4 110,26 170,14 C230,2 280,26 340,16 C400,6 450,24 510,14 C570,4 620,24 680,16 C730,10 770,16 796,12";

/** Tips 展开后自动折回的时长（鼠标停在里面时不收） */
const HINT_AUTO_FOLD_MS = 6000;

interface HeroNoteProps {
  /** 正在等 LLM 解析：便签内容替换为"正在理解这一刻…" */
  thinking: boolean;
}

export default function HeroNote({ thinking }: HeroNoteProps) {
  const reduce = useReducedMotion();
  const [hintOpen, setHintOpen] = useState(false);
  const [hintHovered, setHintHovered] = useState(false);

  // 展开 6 秒后自己折回去；鼠标正在读的时候先不收
  useEffect(() => {
    if (!hintOpen || hintHovered) return;
    const id = setTimeout(() => setHintOpen(false), HINT_AUTO_FOLD_MS);
    return () => clearTimeout(id);
  }, [hintOpen, hintHovered]);

  // 视差只用两个 motion value，贴纸按"远近"分两组
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const slowX = useTransform(mx, [-1, 1], [-5, 5]);
  const slowY = useTransform(my, [-1, 1], [-4, 4]);
  const fastX = useTransform(mx, [-1, 1], [-9, 9]);
  const fastY = useTransform(my, [-1, 1], [-6, 6]);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    my.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const resetParallax = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <section
      className="pt-10 sm:pt-14"
      onPointerMove={handleMove}
      onPointerLeave={resetParallax}
    >
      <div
        className="paper-card relative mx-auto max-w-2xl rounded-md px-5 pb-6 pt-9 sm:px-8"
        style={
          {
            "--write-char": `${CHAR_WRITE_S}s`,
            "--write-step": `${CHAR_STEP_S}s`,
            "--write-duration": `${WRITE_DURATION}s`,
          } as CSSProperties
        }
      >
        <Tape
          rotation={-3}
          color="rgba(228,199,120,0.62)"
          className="logo-tape"
          style={{ top: -10, left: "50%", marginLeft: -38, width: 76, height: 20 }}
        />

        {/* 可撕的纸角：点开三步用法 */}
        <button
          type="button"
          className="note-tear"
          aria-label="怎么用此刻音乐"
          aria-expanded={hintOpen}
          title={hintOpen ? "收起说明" : "点一下看怎么用"}
          onClick={() => setHintOpen((open) => !open)}
        />
        <AnimatePresence>
          {hintOpen ? (
            <motion.div
              /* rotate 交给 motion（内联 transform 会覆盖 .paper-slip 的 CSS 旋转）*/
              initial={{ opacity: 0, y: -8, rotate: -3, scaleY: 0.92 }}
              animate={{ opacity: 1, y: 0, rotate: -1, scaleY: 1 }}
              exit={{ opacity: 0, y: -6, rotate: -4, scaleY: 0.86 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              style={{ transformOrigin: "top left" }}
              onPointerEnter={() => setHintHovered(true)}
              onPointerLeave={() => setHintHovered(false)}
              className="paper-slip absolute left-4 top-4 z-20 w-60 p-3"
            >
              <p className="slip-title">Tips</p>
              <p className="slip-step">
                <span className="slip-n">①</span>说一句此刻，比如「下午有点累」
              </p>
              <p className="slip-step">
                <span className="slip-n">②</span>AI 把它翻译成场景 / 情绪 / 节奏
              </p>
              <p className="slip-step">
                <span className="slip-n">③</span>连跳 2 首，它会重新理解你
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {thinking ? (
          <>
            {/* 保留那条旋律线，让"同一张纸"的感觉不中断 */}
            <div className="relative h-8">
              <svg
                className="hero-thinking-melody"
                viewBox="0 0 800 30"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path className="hero-melody" d={MELODY_PATH} />
              </svg>
            </div>
            <div className="hero-thinking">
              <span className="handwritten text-3xl text-ink sm:text-4xl">
                正在理解这一刻…
              </span>
              <span className="flex gap-1.5" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="think-dot"
                    style={{ animationDelay: `${i * 0.16}s` }}
                  />
                ))}
              </span>
              <span className="text-xs text-brown">马上就好，正在把它变成一批歌</span>
            </div>
          </>
        ) : (
          <>
            {/* 音乐拼贴：站内现成的涂鸦 + 一条手绘旋律线 */}
            <div className="relative h-16 sm:h-36">
              <motion.span
                style={{ x: slowX, y: slowY }}
                className="pointer-events-none absolute left-4 top-1 hidden sm:block"
              >
                <DoodleVinyl size={82} />
              </motion.span>
              <motion.span
                style={{ x: fastX, y: fastY }}
                className="pointer-events-none absolute left-28 top-11 hidden sm:block"
              >
                <DoodleCassette size={66} />
              </motion.span>
              <motion.span
                style={{ x: fastX, y: fastY }}
                className="pointer-events-none absolute right-28 top-2 hidden sm:block"
              >
                <DoodleNote size={72} />
              </motion.span>
              <motion.span
                style={{ x: slowX, y: slowY }}
                className="pointer-events-none absolute right-4 top-14 hidden sm:block"
              >
                <DoodleHeadphones size={68} />
              </motion.span>
              <svg
                className="pointer-events-none absolute inset-x-4 top-1/2 h-6 -translate-y-1/2"
                viewBox="0 0 800 30"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  className="hero-melody"
                  d={MELODY_PATH}
                />
              </svg>
            </div>

            <h1 className="handwritten relative text-center text-4xl leading-tight text-ink sm:text-5xl">
              {/* 用一个 inline-block 把标题框成"文字自身的宽度"：
                  这样笔尖的 0 → 100% 是从第一个字走到最后一个字，
                  而不是走完整张卡片的宽度（旧版就是走满整卡，所以对不上字） */}
              <span className="relative inline-block">
                {TITLE_CHARS.map((item, i) => (
                  <span
                    key={`${item.char}-${i}`}
                    className={item.tone === "brick" ? "hero-char text-brick" : "hero-char"}
                    style={{ animationDelay: `${i * CHAR_STEP_S}s` }}
                  >
                    {item.char}
                  </span>
                ))}
                {/* 笔尖：横向位移由 framer 按字跳跃，竖直的"抬笔"由 CSS pen-bob 负责 */}
                <motion.span
                  className="hero-pen"
                  aria-hidden
                  initial={{ left: "0%" }}
                  animate={{ left: "100%" }}
                  transition={{ duration: WRITE_DURATION, ease: penStepEase }}
                />
              </span>
            </h1>

            <p className="mt-3 text-center text-brown">不用找歌，告诉我这一刻。</p>
          </>
        )}
      </div>
    </section>
  );
}
