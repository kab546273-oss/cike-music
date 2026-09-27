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

/** Which dimension the engine had to give up on. */
export type RecommendationRelaxationDimension = "bpm" | "vocal" | "style";

/**
 * One relaxation the engine applied because the request could not be
 * satisfied verbatim — surfaced in the UI so the app never silently
 * returns something other than what the user asked for.
 */
export interface RecommendationRelaxation {
  dimension: RecommendationRelaxationDimension;
  message: string;
}

/** Context returned alongside recommendations so the UI can explain *why* */
export interface RecommendationContext {
  scene: string | null;
  mood: string | null;
  /** The BPM band actually used (may be wider than requested). */
  bpmRange: string;
  /** The vocal level actually used (may be relaxed by one notch). */
  vocal: VocalLevel;
  /** The style tags actually excluded (normalized catalog tags). */
  exclude_style: string[];
  regenerationCount: number;
  reason: string;
  /**
   * 曲库总曲目数，用于"从 N 首里挑出这 10 首"的来源说明。
   * 推荐引擎一定会给；虚拟歌单（如「我喜欢」）没有这个概念，所以可选。
   */
  catalogSize?: number;
  /** Empty when the request was satisfied verbatim. */
  relaxations: RecommendationRelaxation[];
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
  | "song_like"
  | "playlist_regenerate"
  | "playlist_shuffle"
  | "playlist_save"
  | "playlist_replay"
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
  /** Machine-readable failure reason, for better fallback copy. */
  reason?: ParseFailureReason;
  error?: string;
}

export type ParseFailureReason =
  | "LLM_NOT_CONFIGURED"
  | "LLM_TIMEOUT"
  | "LLM_API_ERROR"
  | "INVALID_OUTPUT"
  | "LOW_CONFIDENCE"
  | "BAD_REQUEST"
  | "UNKNOWN";

export interface RecommendRequest {
  preferences: MusicPreferences;
  /** Song ids already played this session — penalized to zero. */
  history?: string[];
  /** Song ids to hard-exclude (e.g. "换一批"). */
  excludeIds?: string[];
  /** How many regeneration rounds already happened. */
  regenerationCount?: number;
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
  /** Song ids already played — keeps regenerated lists from repeating. */
  history?: string[];
}

export interface FeedbackResponse {
  success: boolean;
  adjustedPreferences?: MusicPreferences;
  songs?: Song[];
  context?: RecommendationContext;
  shouldRegenerate: boolean;
  maxReached?: boolean;
  regenerationCount?: number;
  message?: string;
  error?: string;
}

export interface EventsRequest {
  events: AnalyticsEvent[];
}

export interface EventsResponse {
  success: boolean;
  recorded: number;
}
