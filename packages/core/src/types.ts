export type TrackSource = "spotify" | "youtube" | "apple" | "local";

export interface TrackHandle {
  id: string; // internal id
  source: TrackSource;
  sourceId: string; // provider id or "local:<hash>"
  title: string;
  artist: string;
  durationMs: number;
  isrc?: string;
  album?: string;
  artworkUrl?: string;
}

export interface Analysis {
  tempo?: number;
  key?: number;
  energy?: number;
  loudness?: number;
  beats?: { t: number; isDownbeat?: boolean }[];
  bars?: { t: number }[];
  sections?: { start: number; duration: number; label?: string }[];
  valence?: number;
  danceability?: number;
  instrumentalness?: number;
}

export interface BeatSnapshot {
  beatIndex: number;
  beatPhase: number; // 0..1
  barPhase: number; // 0..1
  sectionIndex: number;
  currentTime: number;
  bpm: number;
}

export interface SourceCapabilities {
  playback: boolean;
  pcm: boolean;
  officialAnalysis: boolean;
  allowAudioExport: boolean;
  allowSeeking: boolean;
}

export interface ISourceAdapter {
  kind: TrackSource;
  capabilities: SourceCapabilities;
  parseUrl(url: string): Promise<{ sourceId: string } | null>;
  fetchMetadata(sourceId: string): Promise<TrackHandle>;
  fetchAnalysis?(sourceId: string): Promise<Analysis>; // Spotify only
  getPlaybackElement(opts: {
    sourceId: string;
    auth?: any;
  }): Promise<HTMLIFrameElement | HTMLAudioElement>; // DRM-safe
}

export interface Scene {
  id: string;
  name: string;
  shaderPack: string;
  params: Record<string, any>;
  isPublic: boolean;
  createdAt: Date;
}

export interface Clip {
  id: string;
  trackId: string;
  sceneId?: string;
  startMs: number;
  endMs: number;
  url: string;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  spotifyId?: string;
  appleId?: string;
  createdAt: Date;
}
