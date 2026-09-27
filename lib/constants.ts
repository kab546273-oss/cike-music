import type { MusicPreferences, VocalLevel } from "@/types";

// ============================================================
// 14 Preset Scenes — fast path, no LLM call
// ============================================================
export interface ScenePreset {
  id: string;
  label: string;
  icon: string; // lucide icon name (resolved in component)
  emoji: string;
  preferences: Omit<MusicPreferences, "confidence">;
  rotation: number; // scrapbook random rotation
  tapeColor: string;
}

export const SCENE_PRESETS: ScenePreset[] = [
  {
    id: "study",
    label: "自习",
    icon: "BookOpen",
    emoji: "📖",
    rotation: -1.5,
    tapeColor: "#E4C778",
    preferences: { scene: "study", mood: "focused", bpm_min: 60, bpm_max: 85, vocal: "none", exclude_style: ["edm", "rock", "dance"] },
  },
  {
    id: "work",
    label: "办公",
    icon: "Laptop",
    emoji: "💻",
    rotation: 1,
    tapeColor: "#84906B",
    preferences: { scene: "work", mood: "focused", bpm_min: 70, bpm_max: 95, vocal: "low", exclude_style: ["edm", "rock"] },
  },
  {
    id: "exam",
    label: "备考",
    icon: "GraduationCap",
    emoji: "🎓",
    rotation: -0.8,
    tapeColor: "#B86F5E",
    preferences: { scene: "exam", mood: "focused", bpm_min: 65, bpm_max: 85, vocal: "none", exclude_style: ["edm", "rock", "dance", "hiphop"] },
  },
  {
    id: "reading",
    label: "阅读",
    icon: "BookMarked",
    emoji: "☕",
    rotation: 1.2,
    tapeColor: "#E4C778",
    preferences: { scene: "reading", mood: "relaxed", bpm_min: 70, bpm_max: 90, vocal: "low", exclude_style: ["rock", "edm"] },
  },
  {
    id: "commute",
    label: "通勤",
    icon: "Train",
    emoji: "🚇",
    rotation: -1,
    tapeColor: "#6B5745",
    preferences: { scene: "commute", mood: "chill", bpm_min: 80, bpm_max: 110, vocal: "medium", exclude_style: ["classical"] },
  },
  {
    id: "walk",
    label: "散步",
    icon: "Footprints",
    emoji: "🚶",
    rotation: 0.7,
    tapeColor: "#84906B",
    preferences: { scene: "walk", mood: "free", bpm_min: 85, bpm_max: 110, vocal: "low", exclude_style: ["edm", "metal"] },
  },
  {
    id: "running",
    label: "跑步",
    icon: "Zap",
    emoji: "🏃",
    rotation: -1.8,
    tapeColor: "#B86F5E",
    preferences: { scene: "running", mood: "energetic", bpm_min: 140, bpm_max: 175, vocal: "high", exclude_style: ["classical", "new-age", "lullaby"] },
  },
  {
    id: "fitness",
    label: "健身",
    icon: "Dumbbell",
    emoji: "💪",
    rotation: 1.5,
    tapeColor: "#B86F5E",
    preferences: { scene: "fitness", mood: "energetic", bpm_min: 125, bpm_max: 160, vocal: "high", exclude_style: ["classical", "new-age", "lullaby", "ambient"] },
  },
  {
    id: "cycling",
    label: "骑行",
    icon: "Bike",
    emoji: "🚴",
    rotation: -0.5,
    tapeColor: "#84906B",
    preferences: { scene: "cycling", mood: "free", bpm_min: 100, bpm_max: 130, vocal: "medium", exclude_style: ["classical", "lullaby"] },
  },
  {
    id: "afternoon",
    label: "午后",
    icon: "Sun",
    emoji: "🌤️",
    rotation: 1.8,
    tapeColor: "#E4C778",
    preferences: { scene: "afternoon", mood: "lazy", bpm_min: 70, bpm_max: 95, vocal: "low", exclude_style: ["rock", "edm", "hiphop"] },
  },
  {
    id: "tipsy",
    label: "微醺",
    icon: "Wine",
    emoji: "🍷",
    rotation: -1.2,
    tapeColor: "#B86F5E",
    preferences: { scene: "tipsy", mood: "romantic", bpm_min: 75, bpm_max: 100, vocal: "medium", exclude_style: ["edm", "rock", "metal"] },
  },
  {
    id: "cat",
    label: "撸猫",
    icon: "Cat",
    emoji: "🐱",
    rotation: 0.9,
    tapeColor: "#E4C778",
    preferences: { scene: "cat", mood: "warm", bpm_min: 65, bpm_max: 90, vocal: "low", exclude_style: ["rock", "edm", "dance"] },
  },
  {
    id: "travel",
    label: "旅行",
    icon: "Plane",
    emoji: "✈️",
    rotation: -2,
    tapeColor: "#84906B",
    preferences: { scene: "travel", mood: "free", bpm_min: 90, bpm_max: 120, vocal: "medium", exclude_style: ["metal"] },
  },
  {
    id: "shopping",
    label: "逛街",
    icon: "ShoppingBag",
    emoji: "🛍️",
    rotation: 1.1,
    tapeColor: "#B86F5E",
    preferences: { scene: "shopping", mood: "happy", bpm_min: 100, bpm_max: 130, vocal: "high", exclude_style: ["classical", "new-age", "ambient"] },
  },
];

// ============================================================
// 11 Mood Tags — can overlay on a scene
// （原本有 12 个，删掉了「活力/energetic」：首页 chip 换手绘图标后
//   12 个会在 1440px 下挤成两行，去掉它正好一行放下。
//   活力 并没有消失——跑步/健身场景预设、自然语言输入、老歌单里
//   mood: "energetic" 都还能正常用，只是不再作为手动 chip。）
// ============================================================
export interface MoodPreset {
  id: string;
  label: string;
  emoji: string;
}

export const MOOD_PRESETS: MoodPreset[] = [
  { id: "happy", label: "开心", emoji: "😊" },
  { id: "motivational", label: "励志", emoji: "💪" },
  { id: "chill", label: "放松", emoji: "🌿" },
  { id: "healing", label: "治愈", emoji: "🫶" },
  { id: "warm", label: "温馨", emoji: "🏠" },
  { id: "relaxed", label: "惬意", emoji: "☕" },
  { id: "sad", label: "伤感", emoji: "😢" },
  { id: "lonely", label: "孤独", emoji: "🌙" },
  { id: "melancholy", label: "忧郁", emoji: "🌧️" },
  { id: "romantic", label: "浪漫", emoji: "💕" },
  { id: "lazy", label: "慵懒", emoji: "😴" },
];

// Map mood label (Chinese) to mood value used in music.json
export const MOOD_LABEL_TO_VALUE: Record<string, string> = {
  开心: "happy",
  励志: "motivational",
  活力: "energetic",
  放松: "chill",
  治愈: "healing",
  温馨: "warm",
  惬意: "relaxed",
  伤感: "sad",
  孤独: "lonely",
  忧郁: "melancholy",
  浪漫: "romantic",
  慵懒: "lazy",
};

// Scene label Chinese for display
export const SCENE_LABEL_MAP: Record<string, string> = {
  study: "自习",
  work: "办公",
  exam: "备考",
  reading: "阅读",
  commute: "通勤",
  walk: "散步",
  running: "跑步",
  fitness: "健身",
  cycling: "骑行",
  afternoon: "午后",
  tipsy: "微醺",
  cat: "撸猫",
  travel: "旅行",
  shopping: "逛街",
};

// Mood value to Chinese label
export const MOOD_VALUE_TO_LABEL: Record<string, string> = {
  happy: "开心",
  motivational: "励志",
  energetic: "活力",
  chill: "放松",
  healing: "治愈",
  warm: "温馨",
  relaxed: "惬意",
  sad: "伤感",
  lonely: "孤独",
  melancholy: "忧郁",
  romantic: "浪漫",
  lazy: "慵懒",
  calm: "平静",
  focused: "专注",
  free: "自由",
};

// Vocal level display
export const VOCAL_LABEL: Record<string, string> = {
  none: "无人声",
  low: "低人声",
  medium: "中人声",
  high: "高人声",
};

// ============================================================
// 曲库词表 — single source of truth
// ⚠️ 以下风格 / 心情列表必须与 data/music.json 保持一致。
//
// 背景：旧版 SCENE_STYLE_WEIGHTS 里大量使用了 lo-fi / chillhop /
// ambient / classical / lullaby / bossa 这些曲库里一首都没有的标签，
// 导致自习 / 备考 / 撸猫场景只有 5% 的歌能在风格维度拿到区分度，
// 风格权重（0.20~0.25）实际上被静默浪费。
//
// 改词表后请跑 `npm run audit:vocab` 校验与曲库的对齐情况。
// ============================================================

/** 曲库中真实存在的风格标签（39 个）。 */
export const CATALOG_STYLES = [
  "acoustic",
  "alternative",
  "ambient",
  "art-pop",
  "baroque-pop",
  "bebop",
  "britpop",
  "chill",
  "chillhop",
  "cinematic",
  "classical",
  "dance",
  "dance-punk",
  "disco",
  "edm",
  "electronic",
  "folk",
  "funk",
  "hiphop",
  "indie",
  "indie-folk",
  "indie-pop",
  "indie-rock",
  "j-pop",
  "jangle",
  "jazz",
  "lo-fi",
  "modal",
  "neo-soul",
  "new-age",
  "new-wave",
  "pop-vocal",
  "rap",
  "rnb",
  "rock",
  "soul",
  "swing",
  "synth-pop",
  "trap",
] as const;

/**
 * 历史标签 / LLM 可能返回、但曲库里不存在的标签 → 曲库标签。
 * 用于两处：排除风格（hard filter）与场景风格偏好，避免
 * "排除了一个不存在的标签"或"偏好了一个不存在的标签"这种静默失效。
 */
export const STYLE_ALIASES: Record<string, string[]> = {
  "lo-fi": ["chill", "electronic", "neo-soul"],
  lofi: ["chill", "electronic", "neo-soul"],
  "lo fi": ["chill", "electronic", "neo-soul"],
  chillhop: ["chill", "electronic", "hiphop"],
  "chill-hop": ["chill", "electronic", "hiphop"],
  ambient: ["new-age", "cinematic", "electronic"],
  classical: ["new-age", "baroque-pop", "modal"],
  lullaby: ["new-age", "acoustic", "chill"],
  bossa: ["jazz", "acoustic"],
  "bossa-nova": ["jazz", "acoustic"],
  pop: ["pop-vocal"],
  "hip-hop": ["hiphop"],
  "hip hop": ["hiphop"],
  "r&b": ["rnb"],
  jpop: ["j-pop"],
  "singer-songwriter": ["folk", "acoustic"],
  民谣: ["folk"],
  爵士: ["jazz"],
  电子: ["electronic"],
  摇滚: ["rock"],
  说唱: ["hiphop", "rap"],
  纯音乐: ["new-age", "cinematic"],
};

/** 风格标签 → 中文（UI 展示用，避免全中文界面里裸露英文 slug）。 */
export const STYLE_LABELS: Record<string, string> = {
  acoustic: "原声吉他",
  alternative: "另类",
  ambient: "氛围音乐",
  "art-pop": "艺术流行",
  "baroque-pop": "巴洛克流行",
  bebop: "比博普",
  britpop: "英伦摇滚",
  chill: "慵懒电子",
  chillhop: "弛放嘻哈",
  cinematic: "电影感",
  classical: "古典",
  dance: "舞曲",
  "dance-punk": "舞曲朋克",
  disco: "迪斯科",
  edm: "电子舞曲",
  electronic: "电子",
  folk: "民谣",
  funk: "放克",
  hiphop: "嘻哈",
  indie: "独立",
  "indie-folk": "独立民谣",
  "indie-pop": "独立流行",
  "indie-rock": "独立摇滚",
  "j-pop": "日系流行",
  jangle: "叮当吉他",
  jazz: "爵士",
  "lo-fi": "低保真",
  modal: "调式爵士",
  "neo-soul": "新灵魂乐",
  "new-age": "新世纪",
  "new-wave": "新浪潮",
  "pop-vocal": "流行演唱",
  rap: "说唱",
  rnb: "节奏布鲁斯",
  rock: "摇滚",
  soul: "灵魂乐",
  swing: "摇摆乐",
  "synth-pop": "合成器流行",
  trap: "陷阱说唱",
};

/** 曲库中真实存在的心情标签（28 个）。 */
export const CATALOG_MOODS = [
  "calm",
  "chill",
  "cool",
  "dark",
  "dramatic",
  "energetic",
  "epic",
  "focused",
  "free",
  "fun",
  "groovy",
  "happy",
  "healing",
  "hopeful",
  "intense",
  "lazy",
  "lonely",
  "melancholy",
  "mischievous",
  "motivational",
  "nostalgic",
  "quirky",
  "relaxed",
  "resigned",
  "romantic",
  "sad",
  "satirical",
  "self-conscious",
  "warm",
] as const;

/** 合法的心情偏好值 = 曲库心情（已含 relaxed / lazy / focused）。 */
export const PREFERENCE_MOODS = [
  ...CATALOG_MOODS,
] as const;

/** 心情别名（中文 / 英文同义词）→ 心情偏好值。 */
export const MOOD_ALIASES: Record<string, string> = {
  ...MOOD_LABEL_TO_VALUE,
  ...Object.fromEntries(PREFERENCE_MOODS.map((m) => [m, m])),
  平静: "calm",
  专注: "focused",
  自由: "free",
  怀旧: "nostalgic",
  强烈: "intense",
  愉快: "fun",
  暗色: "dark",
  充满希望: "hopeful",
  律动: "groovy",
  史诗: "epic",
  酷: "cool",
  顽皮: "mischievous",
  戏剧性: "dramatic",
  自省: "self-conscious",
  释然: "resigned",
  讽刺: "satirical",
  古怪: "quirky",
  "easy-listening": "chill",
};

/** 场景别名（中文 / 英文同义词）→ 场景 id。 */
export const SCENE_ALIASES: Record<string, string> = {
  自习: "study",
  学习: "study",
  办公: "work",
  工作: "work",
  备考: "exam",
  复习: "exam",
  阅读: "reading",
  通勤: "commute",
  散步: "walk",
  跑步: "running",
  健身: "fitness",
  骑行: "cycling",
  午后: "afternoon",
  微醺: "tipsy",
  撸猫: "cat",
  旅行: "travel",
  逛街: "shopping",
  studying: "study",
  office: "work",
  walking: "walk",
  gym: "fitness",
  workout: "fitness",
  bike: "cycling",
  drinking: "tipsy",
  coffee: "afternoon",
};

/** 人声别名（中文 / instrumental 等）→ VocalLevel。 */
export const VOCAL_ALIASES: Record<string, VocalLevel> = {
  none: "none",
  instrumental: "none",
  无人声: "none",
  纯音乐: "none",
  器乐: "none",
  无: "none",
  low: "low",
  低人声: "low",
  少人声: "low",
  medium: "medium",
  中人声: "medium",
  正常人声: "medium",
  high: "high",
  高人声: "high",
  强人声: "high",
};

/** 把任意人声描述归一化到 VocalLevel，无法识别时返回 null。 */
export function normalizeVocal(value: unknown): VocalLevel | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return VOCAL_ALIASES[trimmed] ?? VOCAL_ALIASES[trimmed.toLowerCase()] ?? null;
}

/** 把单个风格标签归一化到曲库标签，未知标签返回空数组。 */
export function normalizeStyleTag(tag: unknown): string[] {
  if (typeof tag !== "string") return [];
  const key = tag.trim().toLowerCase();
  if (!key) return [];
  if ((CATALOG_STYLES as readonly string[]).includes(key)) return [key];
  const alias = STYLE_ALIASES[key];
  return alias ? [...alias] : [];
}

/** 把标签列表（或逗号分隔字符串）归一化为去重后的曲库标签。 */
export function normalizeStyleList(tags: unknown): string[] {
  const raw =
    typeof tags === "string"
      ? tags.split(/[,，、;；/|]+/)
      : Array.isArray(tags)
        ? tags
        : [];
  const out: string[] = [];
  for (const tag of raw) {
    for (const style of normalizeStyleTag(tag)) {
      if (!out.includes(style)) out.push(style);
    }
  }
  return out;
}

/** 把任意场景描述归一化到场景 id，无法识别时返回 null。 */
export function normalizeScene(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const key = value.trim();
  if (!key) return null;
  if (SCENE_PRESETS.some((s) => s.id === key)) return key;
  return SCENE_ALIASES[key] ?? SCENE_ALIASES[key.toLowerCase()] ?? null;
}

/** 把任意心情描述归一化到心情偏好值，无法识别时返回 null。 */
export function normalizeMood(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const key = value.trim();
  if (!key) return null;
  return MOOD_ALIASES[key] ?? MOOD_ALIASES[key.toLowerCase()] ?? null;
}

/** 风格标签的中文展示名。 */
export function styleLabel(style: string): string {
  return STYLE_LABELS[style] ?? style;
}

/** 心情值的中文展示名。 */
export function moodLabel(mood: string | null | undefined): string | null {
  if (!mood) return null;
  return MOOD_VALUE_TO_LABEL[mood] ?? mood;
}

// ============================================================
// 负反馈 / 重生成规则 — 客户端与服务端共用的唯一来源
// （旧版在 app/playlist/page.tsx 里另写了一份 MAX_REGEN，容易与后端漂移）
// ============================================================

/** 连续跳过几首后触发重新生成。 */
export const SKIP_THRESHOLD = 2;

/** 一轮会话内最多重新生成几次。 */
export const MAX_REGENERATIONS = 2;

/** 超过重生成上限后的提示文案。 */
export const REGENERATION_MESSAGE = "我们换个描述试试，也许会更接近你。";

/**
 * 歌单页最短"AI 思考"展示时长（ms）。
 * 清单动效 2.05s 才写到"✦ 10 首刚刚好的歌"，留到 2.6s 才不会被截断在收笔前。
 */
export const MIN_AI_THINKING_MS = 2600;
