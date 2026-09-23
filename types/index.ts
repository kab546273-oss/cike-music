// ============================================================
// 此刻音乐 — Unified TypeScript Types
// ============================================================

/** A single song entry from data/music.json */
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
  bpm: number;
  vocal_level: VocalLevel;
  is_instrumental: boolean;
  style: string[];
  mood: string[];
  has_copyright: boolean;
  is_lossless: boolean;
}

export type VocalLevel = "none" | "low" | "medium" | "high";

/** Structured music preferences produced by LLM or preset scene */
export interface MusicPreferences {
  scene: string | null;
  mood: string | null;
  bpm_min: number;
  bpm_max: number;
  vocal: VocalLevel;
  exclude_style: string[];
  confidence: number; // 0 ~ 1
}

/** Context returned alongside recommendations so the UI can explain *why* */
export interface RecommendationContext {
  scene: string | null;
  mood: string | null;
  bpmRange: string;
  vocal: VocalLevel;
  exclude_style: string[];
  regenerationCount: number;
  reason: string;
}

/** Result of the recommendation engine */
export interface RecommendationResult {
  songs: Song[];
  context: RecommendationContext;
}

/** Negative feedback state tracked per playlist session */
export interface FeedbackState {
  skipCount: number;
  skippedSongs: Song[];
  regenerationCount: number;
  adjustedPreferences: MusicPreferences | null;
  lastFeedbackAt: number | null;
}

/** A saved playlist in localStorage */
export interface Playlist {
  id: string;
  name: string;
  createdAt: number;
  songs: Song[];
  preferences: MusicPreferences;
  context: RecommendationContext;
}

/** Analytics event types */
export type AnalyticsEventType =
  | "scene_click"
  | "text_submit"
  | "playlist_generate"
  | "song_play"
  | "song_skip"
  | "playlist_regenerate"
  | "playlist_save"
  | "member_modal_view"
  | "member_modal_click";

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: number;
  payload?: Record<string, unknown>;
}

// ---------- API Contracts ----------

export interface ParseRequest {
  text: string;
}

export interface ParseResponse {
  success: boolean;
  preferences?: MusicPreferences;
  confidence?: number;
  error?: string;
}

export interface RecommendRequest {
  preferences: MusicPreferences;
  history?: string[]; // song ids recently played
  feedback?: FeedbackState;
}

export interface RecommendResponse {
  success: boolean;
  songs?: Song[];
  context?: RecommendationContext;
  error?: string;
}

export interface FeedbackRequest {
  preferences: MusicPreferences;
  skippedSongs: Song[];
  regenerationCount: number;
}

export interface FeedbackResponse {
  success: boolean;
  adjustedPreferences?: MusicPreferences;
  shouldRegenerate: boolean;
  maxReached?: boolean;
  message?: string;
}

export interface EventsRequest {
  events: AnalyticsEvent[];
}

export interface EventsResponse {
  success: boolean;
  recorded: number;
}
