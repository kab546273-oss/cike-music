"use client";

import { motion } from "framer-motion";
import type { MusicPreferences, RecommendationContext } from "@/types";
import {
  SCENE_LABEL_MAP,
  VOCAL_LABEL,
  moodLabel,
  styleLabel,
} from "@/lib/constants";
import PaperCard from "@/components/scrapbook/PaperCard";
import { DoodleVinyl } from "@/components/scrapbook/Doodles";

interface AIInterpretationProps {
  preferences: MusicPreferences;
  /** 推荐引擎实际使用的参数（可能放宽过），用来展示"我让步了什么"。 */
  context?: RecommendationContext | null;
  /** 实际返回的曲目数，用于底部的来源说明 */
  songCount?: number;
}

/** 最多展示几个"避开"的风格，超出折叠成 +N */
const MAX_EXCLUDE_CHIPS = 4;

/**
 * 理解卡：唱片背面（liner notes）。
 *
 * 左边一张唱片套贴纸，右边是"制作信息"式的字段（点线引导），
 * 右上角盖一枚 MATCH 印章代表匹配度；让步说明与来源信息放在
 * 封底小字的位置（细线下方），保持卡片本身干净。
 */
export default function AIInterpretation({
  preferences,
  context,
  songCount,
}: AIInterpretationProps) {
  const sceneLabel = preferences.scene ? SCENE_LABEL_MAP[preferences.scene] : null;
  const moodText = moodLabel(preferences.mood);
  const vocalLabel = VOCAL_LABEL[preferences.vocal] ?? "中人声";
  const matchPct = Math.round(preferences.confidence * 100);

  const excluded = preferences.exclude_style;
  const shownExcluded = excluded.slice(0, MAX_EXCLUDE_CHIPS);
  const hiddenExcluded = excluded.length - shownExcluded.length;

  const relaxations = context?.relaxations ?? [];
  const catalogSize = context?.catalogSize ?? 0;

  const rows: Array<{ label: string; value: React.ReactNode }> = [
    { label: "场景", value: sceneLabel ?? "随心情" },
    { label: "情绪", value: moodText ?? "随性" },
    { label: "节奏", value: `${preferences.bpm_min}–${preferences.bpm_max} BPM` },
    { label: "人声", value: vocalLabel },
  ];

  // 匹配度低的时候，卡片要给一句可操作的提示，而不只是展示数字
  const nudge =
    matchPct >= 85
      ? "看起来对上你了"
      : matchPct >= 70
        ? "如果不太准，点「换一批」就行"
        : "要不……说得再具体一点？";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
    >
      <PaperCard tape rotation={-0.8} className="mx-auto max-w-md p-6">
        <div className="liner">
          {/* 唱片套贴纸 */}
          <div className="liner-sleeve" aria-hidden>
            <DoodleVinyl size={72} />
          </div>

          <div className="liner-fields">
            <div className="liner-head">
              <h3 className="liner-title">此刻的你</h3>
              <span className="match-stamp" title="AI 对这次理解的确信度">
                MATCH {matchPct}%
              </span>
            </div>

            <motion.dl
              className="liner-list"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
            >
              {rows.map((row) => (
                <motion.div
                  key={row.label}
                  className="liner-row"
                  variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
                >
                  <dt>{row.label}</dt>
                  <span className="dots" aria-hidden />
                  <dd>{row.value}</dd>
                </motion.div>
              ))}

              {shownExcluded.length > 0 ? (
                <motion.div
                  className="liner-row"
                  variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
                >
                  <dt>避开</dt>
                  <span className="dots" aria-hidden />
                  <dd className="liner-ex">
                    {shownExcluded.map((style) => (
                      <span key={style} className="liner-chip">
                        {styleLabel(style)}
                      </span>
                    ))}
                    {hiddenExcluded > 0 ? (
                      <span className="liner-more">+{hiddenExcluded}</span>
                    ) : null}
                  </dd>
                </motion.div>
              ) : null}
            </motion.dl>
          </div>
        </div>

        <hr className="liner-rule" />

        {relaxations.length > 0 ? (
          <div className="liner-relax">
            <p className="liner-relax-title">这一批我做了点让步</p>
            {relaxations.map((item) => (
              <p key={item.message} className="liner-relax-line">
                <span className="mark">※</span>
                {item.message}
              </p>
            ))}
          </div>
        ) : null}

        <p className="liner-foot">
          ✦{" "}
          {catalogSize > 0
            ? `从 ${catalogSize} 首里挑出${songCount ? `这 ${songCount} 首` : "这一批"}`
            : `挑出${songCount ? `这 ${songCount} 首` : "这一批"}`}
          {preferences.exclude_style.length > 0 ? " · 已排除你不想要的风格" : " · 没有强制排除"}
        </p>
        <p className="liner-nudge">{nudge}</p>
      </PaperCard>
    </motion.div>
  );
}
