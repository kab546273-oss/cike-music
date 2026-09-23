import type { MusicPreferences } from "@/types";

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
// 12 Mood Tags — can overlay on a scene
// ============================================================
export interface MoodPreset {
  id: string;
  label: string;
  emoji: string;
}

export const MOOD_PRESETS: MoodPreset[] = [
  { id: "happy", label: "开心", emoji: "😊" },
  { id: "motivational", label: "励志", emoji: "💪" },
  { id: "energetic", label: "活力", emoji: "⚡" },
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
