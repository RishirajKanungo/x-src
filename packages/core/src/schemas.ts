import { z } from 'zod';

export const TrackSourceSchema = z.enum(['spotify', 'youtube', 'apple', 'local']);

export const TrackHandleSchema = z.object({
  id: z.string(),
  source: TrackSourceSchema,
  sourceId: z.string(),
  title: z.string(),
  artist: z.string(),
  durationMs: z.number(),
  isrc: z.string().optional(),
  album: z.string().optional(),
  artworkUrl: z.string().url().optional(),
});

export const AnalysisSchema = z.object({
  tempo: z.number().optional(),
  key: z.number().optional(),
  energy: z.number().optional(),
  loudness: z.number().optional(),
  beats: z.array(z.object({
    t: z.number(),
    isDownbeat: z.boolean().optional(),
  })).optional(),
  bars: z.array(z.object({
    t: z.number(),
  })).optional(),
  sections: z.array(z.object({
    start: z.number(),
    duration: z.number(),
    label: z.string().optional(),
  })).optional(),
  valence: z.number().optional(),
  danceability: z.number().optional(),
  instrumentalness: z.number().optional(),
});

export const BeatSnapshotSchema = z.object({
  beatIndex: z.number(),
  beatPhase: z.number(),
  barPhase: z.number(),
  sectionIndex: z.number(),
  currentTime: z.number(),
  bpm: z.number(),
});

export const SourceCapabilitiesSchema = z.object({
  playback: z.boolean(),
  pcm: z.boolean(),
  officialAnalysis: z.boolean(),
  allowAudioExport: z.boolean(),
  allowSeeking: z.boolean(),
});

export const SceneSchema = z.object({
  id: z.string(),
  name: z.string(),
  shaderPack: z.string(),
  params: z.record(z.any()),
  isPublic: z.boolean(),
  createdAt: z.date(),
});

export const ClipSchema = z.object({
  id: z.string(),
  trackId: z.string(),
  sceneId: z.string().optional(),
  startMs: z.number(),
  endMs: z.number(),
  url: z.string().url(),
  createdAt: z.date(),
});

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  spotifyId: z.string().optional(),
  appleId: z.string().optional(),
  createdAt: z.date(),
});
