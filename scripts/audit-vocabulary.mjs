#!/usr/bin/env node
// ============================================================
// scripts/audit-vocabulary.mjs — 词表审计
//
// 检查 lib/recommendation/scoring.ts 使用的风格 / 心情标签，
// 是否都能在 data/music.json 里找到对应歌曲。
//
// 背景：旧版 SCENE_STYLE_WEIGHTS 用了 lo-fi / chillhop / ambient /
// classical / lullaby / bossa —— 这 6 个标签在 200 首里一首都没有，
// 自习场景因此只有 5% 的歌能在风格维度拿到区分度。
//
// 用法：npm run audit:vocab
// 退出码 1 表示存在"表里写了、曲库没有"的风格标签。
// ============================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scoringSrc = fs.readFileSync(
  path.join(root, "lib/recommendation/scoring.ts"),
  "utf8",
);
const songs = JSON.parse(
  fs.readFileSync(path.join(root, "data/music.json"), "utf8"),
);

const dataStyles = new Set(songs.flatMap((s) => s.style));
const dataMoods = new Set(songs.flatMap((s) => s.mood));

// ---------- 场景风格权重表 ----------
const start = scoringSrc.indexOf("export const SCENE_STYLE_WEIGHTS");
const end = scoringSrc.indexOf("\n};", start);
if (start < 0 || end < 0) throw new Error("SCENE_STYLE_WEIGHTS not found");
const body = scoringSrc.slice(start, end);

const table = {};
const sceneRe = /([a-z-]+):\s*\{([^}]*)\}/g;
let match;
while ((match = sceneRe.exec(body))) {
  if (match[1] === "Record") continue;
  table[match[1]] = [
    ...match[2].matchAll(/["']?([a-z0-9-]+)["']?\s*:\s*0?\.\d+/g),
  ].map((x) => x[1]);
}

const rows = Object.entries(table).map(([scene, tags]) => {
  const hit = songs.filter((song) =>
    song.style.some((style) => tags.includes(style)),
  ).length;
  return {
    scene,
    tags: tags.length,
    missing: tags.filter((t) => !dataStyles.has(t)),
    hit,
    pct: Math.round((100 * hit) / songs.length),
  };
});

console.log(
  "scene".padEnd(10),
  "tags".padStart(5),
  "missing".padStart(8),
  "songs".padStart(6),
  "coverage".padStart(9),
);
for (const r of rows.sort((a, b) => a.pct - b.pct)) {
  console.log(
    r.scene.padEnd(10),
    String(r.tags).padStart(5),
    String(r.missing.length).padStart(8),
    String(r.hit).padStart(6),
    `${r.pct}%`.padStart(9),
  );
}

// ---------- 心情关联表 ----------
const moodStart = scoringSrc.indexOf("export const MOOD_RELATIONS");
const moodEnd = scoringSrc.indexOf("\n};", moodStart);
const moodBody = scoringSrc.slice(moodStart, moodEnd);
const moodKeys = [...moodBody.matchAll(/^\s*["']?([a-z-]+)["']?:\s*\[/gm)].map(
  (x) => x[1],
);
const moodValues = [
  ...new Set([...moodBody.matchAll(/"([a-z-]+)"/g)].map((x) => x[1])),
];

const missingStyles = [...new Set(rows.flatMap((r) => r.missing))].sort();
const moodKeysWithoutSongs = moodKeys.filter((m) => !dataMoods.has(m));
const moodValuesMissing = moodValues.filter((m) => !dataMoods.has(m));

console.log(
  "\n曲库:",
  songs.length,
  "首 |",
  dataStyles.size,
  "种风格 |",
  dataMoods.size,
  "种心情",
);

if (missingStyles.length) {
  console.log("\n❌ 风格权重表里出现但曲库没有的标签:", missingStyles.join(", "));
}
if (moodKeysWithoutSongs.length) {
  console.log(
    "\n⚠️  心情关联表的键在曲库里没有对应歌曲（只能靠 related 拿 0.5 分）:",
    moodKeysWithoutSongs.join(", "),
  );
}
if (moodValuesMissing.length) {
  console.log(
    "\n⚠️  心情关联表引用了曲库没有的心情:",
    [...new Set(moodValuesMissing)].join(", "),
  );
}

if (missingStyles.length) {
  console.log("\n请修 lib/recommendation/scoring.ts，或往 data/music.json 补对应风格的曲子。");
  process.exit(1);
}
console.log("\n✅ 风格权重表与曲库完全对齐。");
