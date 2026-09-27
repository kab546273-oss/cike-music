"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DoodleCassette, DoodleMic } from "@/components/scrapbook/Doodles";
import {
  IconEnergetic,
  IconRomantic,
  IconStudy,
} from "@/components/scrapbook/DoodleIcons";
import Tape from "@/components/scrapbook/Tape";

/**
 * 过场：手写清单 + 卡带在转。
 *
 * 五步文案直接对应推荐管线：
 *   意图理解 → 场景映射 → 情绪 → 收紧 BPM → 排序（多样性打散）出 10 首。
 *
 * 时间线（约 2.35s，留 0.25s 余量给 MIN_AI_THINKING_MS = 2.6s 的预算）：
 *   0.00s 笔尖开始往下走（1.8s，每行 0.36s）
 *   每行写实 0.42s → +0.12s 画手绘 ✓ → +0.18s 贴一小段胶带
 *   1.95s 笔尖淡出；2.05s 右下角揭晓"10 首刚刚好的歌"
 *   全程：右上角卡带的两个卷盘反向旋转（唯一持续动效）
 *   超过 4s 还没好：浮出"还在整理，马上好"（卡带继续转）
 */

const STEP_STAGGER = 0.36;
const WRITE_DURATION = 0.42;
const TICK_AFTER = 0.12;
const TAPE_AFTER = 0.18;
/** 超过这个时长还没拿到结果，就给一句安慰 */
const SLOW_HINT_MS = 4000;

interface Step {
  icon: ComponentType<{ size?: number; className?: string }>;
  text: string;
}

const STEPS: Step[] = [
  { icon: DoodleMic, text: "听你在说什么……" },
  { icon: IconStudy, text: "对上你的场景……" },
  { icon: IconRomantic, text: "记住你的情绪……" },
  { icon: IconEnergetic, text: "收紧节奏的范围……" },
  { icon: DoodleCassette, text: "排好这 10 首的顺序……" },
];

interface AIThinkingProps {
  visible: boolean;
}

export default function AIThinking({ visible }: AIThinkingProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="thinking"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
        >
          <ThinkingCard />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** 单独一层组件：挂载即开始计时，"还在整理"的状态也随每次挂载自然重置 */
function ThinkingCard() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setSlow(true), SLOW_HINT_MS);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="paper-card relative mx-auto max-w-md rounded-md p-6">
      <Tape
        rotation={-3}
        color="rgba(228,199,120,0.62)"
        style={{ top: -10, left: "50%", marginLeft: -38, width: 76, height: 20 }}
      />

      {/* 右上角：一直在转的卡带 */}
      <span className="think-cassette" aria-hidden>
        <DoodleCassette size={46} spinning />
      </span>

      <div className="think-list">
        <span className="think-pen" aria-hidden />
        {STEPS.map((step, i) => {
          const written = i * STEP_STAGGER;
          const tickAt = written + WRITE_DURATION + TICK_AFTER;
          const Icon = step.icon;
          return (
            <div key={step.text} className="think-row">
              <span
                className="think-row-tape"
                style={{ animationDelay: `${tickAt + TAPE_AFTER}s` }}
                aria-hidden
              />
              <span className="think-icon" aria-hidden>
                <Icon size={20} />
              </span>
              <span className="think-text">
                <span className="think-ghost" aria-hidden>
                  {step.text}
                </span>
                <span className="think-inkwrap">
                  <span className="think-ink" style={{ animationDelay: `${written}s` }}>
                    {step.text}
                  </span>
                </span>
              </span>
              <svg className="think-tick" viewBox="0 0 20 16" aria-hidden>
                <path
                  className="think-tick-path"
                  style={{ animationDelay: `${tickAt}s` }}
                  d="M2,9 C5,11 6,13 8,13.5 C12,9 15,4 18,2"
                />
              </svg>
            </div>
          );
        })}
      </div>

      <p className="think-reveal">✦ 10 首刚刚好的歌</p>
      {slow ? <p className="think-slow">还在整理，马上好</p> : null}
    </div>
  );
}
