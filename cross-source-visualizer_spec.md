
# Cross‑Source Music Visualizer — Product & Engineering Spec (2025)

Author: You (with ChatGPT)  
Intended audience: Future you, teammates, and Cursor AI (to provide full project context).  
Scope: MVP → production-ready V1.

---

## 0) Elevator Pitch

Build a **structure‑aware, cross‑source music visualizer** that turns any track into a beat‑synchronized “mini music video.”  
It supports: **Spotify links**, **YouTube links**, **Apple Music links**, plus **local uploads**.  
When DRM prevents raw audio access, visuals are driven by **trusted metadata (tempo/sections)** and a deterministic **Beat Bus** timeline; for local files, we use Web Audio + FFT to derive onsets/tempo.

**Why it’s unique:** scene changes on verse/chorus boundaries, VJ‑style live controls quantized to beat, collaborative rooms with synchronized visuals, shareable clips, and a creator shader marketplace (WebGPU/WGSL).

**What you’ll learn / hiring signal (2025):** Next.js (RSC + Server Actions), WebGPU (WGSL), AudioWorklet DSP, Edge/serverless, typed data w/ Prisma + Postgres, realtime sync, light on‑device ML (ONNX Runtime Web + WebGPU), WebCodecs, CI/CD, observability.

---

## 1) Goals & Non‑Goals

### Goals (MVP)
- Paste a **Spotify** link → fetch track metadata + audio analysis; render visuals driven by tempo/sections/beats.
- **Local file mode**: user uploads MP3/WAV/FLAC → FFT + onset detection drive visuals.
- **Beat Bus**: deterministic timeline (beats, bars, sections) that feeds all shaders and UI quantization.
- **2–3 WebGPU visual packs** (WGSL) + section‑aware camera choreography.
- **Shareable clips**: capture 10–30s visual snippets as MP4/WebM (no copyrighted audio for streaming sources).
- **Collaborative room**: host + guests see the same visuals; controls quantize to the next beat.
- **Compliance**: never attempt DRM bypass; respect ToS and user privacy.

### Non‑Goals (for MVP)
- No full audio exports for DRM‑protected sources.
- No heavy cloud ML pipelines; on‑device, lightweight models only.
- No monetization (Stripe) until V1.
- No stem separation for streaming sources (allowed for local uploads in V1+).

---

## 2) Differentiators (User‑Pull Features)

1. **Structure‑aware scenes**: verse/chorus/bridge auto‑cuts using Spotify Audio Analysis or on‑device estimation.
2. **VJ Mode**: live effect triggers quantized to beats (incl. optional MIDI/OSC later).
3. **Creator Shader Marketplace**: sandboxed WGSL modules; users browse and share presets.
4. **Taste‑based personalization**: color/motion defaults seeded from user’s top genres/artists (Spotify profile).
5. **On‑device “hype moment” detection**: spectral flux peaks trigger camera/bloom changes.
6. **Collaborative rooms**: synced visuals via WebRTC + edge coordination (Durable Object / Redis‑backed channels).
7. **Shareable clips**: one‑click social loop.
8. **Smart lights/haptics (V1+)**: Hue/LIFX bridge and controller rumble aligned to downbeats.
9. **Local stems (V1+)**: optional on‑device/server stem separation for user uploads.
10. **Live wallpaper export (V1+)**: scene pack as desktop screensaver/wallpaper.

---

## 3) Compliance & Platform Constraints

- **Spotify Web Playback**: Premium required for full in‑browser playback; **no PCM** access. Use **Audio Features/Analysis** APIs to drive visuals. For non‑Premium, use `preview_url` (~30s) which can feed Web Audio.
- **YouTube**: IFrame Player API; typically **no PCM**. Drive visuals via **time** + internally derived beat grid (from metadata or heuristics). Do **not** record or re‑mux audio.
- **Apple Music**: MusicKit JS; similar DRM constraints; drive visuals from **time/metadata**.
- **Local Files**: full FFT/DSP allowed; exports can include audio for user‑owned uploads.
- **General**: No DRM circumvention. Provide a **Local‑Only Enhancements** toggle. Respect privacy; store minimal necessary data.

---

## 4) Architecture Overview

### High‑Level Diagram (ASCII)

```
[Browser: Next.js/React + WebGPU + Web Audio]  <--->  [Edge Functions (Server Actions)]
          |   |             |       |                  |      |
          |   |             |       |                  |      +--> Postgres (Neon/Supabase) via Prisma
          |   |             |       +--> ONNX Runtime  |      +--> Redis/Upstash (rooms/presence)
          |   |             +----------> Beat Bus      |      +--> Object Storage (R2/S3) for clips
          |   +--> Providers (Spotify/YouTube/Apple)   |
          |                                            |
          +--> WebRTC (rooms)  <---- Durable Object / Redis channel ---->

(Optional) Heavy jobs: [Python FastAPI Worker] -- Celery/Queues --> FFmpeg / server render / stems
```

### Subsystems
- **Ingestion**: parse link → normalize to `Track`. OAuth for Spotify/Apple. YouTube uses IFrame.
- **Analysis**: Spotify Analysis; for local files, on‑device onset/tempo → Beat Bus.
- **Render Engine**: WebGPU scene graph; uniform block with time/beat/section/energy.
- **Sync**: room host clock + skew correction; quantized actions.
- **Export**: OffscreenCanvas + WebCodecs (client) or headless render (server) for longer clips.

---

## 5) Tech Stack (2025 Hiring‑Friendly)

**Frontend**
- **Next.js (App Router)**, **TypeScript**, **React Server Components**, **Server Actions**
- **Tailwind** + **shadcn/ui**
- **Zustand** or **Jotai** for client state
- **WebGPU** (WGSL) + **Web Audio API** + **AudioWorklet**
- **ONNX Runtime Web** (WebGPU EP) for onset/hype detection
- **Playwright** for E2E; **Vitest** for unit

**Backend / Infra**
- **Edge functions** (Vercel) or **Cloudflare Workers + Durable Objects**
- **Postgres** (Neon/Supabase) + **Prisma**
- **Redis** (Upstash) for pub/sub and presence
- **Object storage** (Cloudflare R2 / S3)
- **Python FastAPI** microservice for optional heavy media jobs
- **OpenTelemetry** + **Sentry**

**Repo**
- Monorepo: **Turborepo** + **pnpm**. CI: **GitHub Actions**.

---

## 6) Data Model (Prisma sketch)

```prisma
model User {
  id          String  @id @default(cuid())
  email       String  @unique
  spotifyId   String? @unique
  appleId     String? @unique
  createdAt   DateTime @default(now())
  scenes      Scene[]
  clips       Clip[]
}

model Track {
  id        String  @id @default(cuid())
  source    TrackSource
  sourceId  String   // e.g., Spotify track id, YouTube video id, "local:<hash>"
  isrc      String?  // if available
  title     String
  artist    String
  durationMs Int
  analyses  Analysis?
  createdAt DateTime @default(now())
}

enum TrackSource { spotify youtube apple local }

model Analysis {
  trackId   String  @id
  track     Track   @relation(fields: [trackId], references: [id])
  tempo     Float?
  key       Int?
  energy    Float?
  loudness  Float?
  beats     Json?   // [{t, i, isDownbeat}]
  bars      Json?
  sections  Json?   // [{start, duration, confidence, label?}]
}

model Scene {
  id         String  @id @default(cuid())
  userId     String
  user       User    @relation(fields: [userId], references: [id])
  name       String
  shaderPack String   // identifier of shader module bundle
  params     Json
  isPublic   Boolean  @default(false)
  createdAt  DateTime @default(now())
}

model Room {
  id         String  @id @default(cuid())
  hostUserId String
  trackId    String
  state      Json      // transport status, bpmLock, current section, etc.
  startedAt  DateTime
}

model Clip {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id])
  trackId   String
  sceneId   String?
  startMs   Int
  endMs     Int
  url       String
  createdAt DateTime @default(now())
}
```

---

## 7) Beat Bus Specification

### Types (TS)
```ts
export type BeatEvent = { t: number; index: number; isDownbeat?: boolean };
export type Section = { start: number; duration: number; label?: string; confidence?: number };

export interface BeatBus {
  tempo: number;                // estimated BPM
  beats: BeatEvent[];           // sorted by time
  bars?: BeatEvent[];           // optional bar downbeats
  sections?: Section[];
  at(time: number): {
    beatIndex: number;
    beatPhase: number;          // 0..1 within current beat
    barPhase: number;           // 0..1 within current bar (if bars known)
    sectionIndex: number;
  };
}
```

### Spotify → Beat Bus
- Use `analysis.beats`, `analysis.bars`, `analysis.sections`, and `analysis.track.tempo`.
- Determine `isDownbeat` for beats whose timestamp matches a bar start within ~1–2ms.

### Local File → Beat Bus
- Do on‑device onset detection (spectral flux). Estimate BPM by autocorrelation / comb filter over onset intervals.
- Smooth tempo with median filtering; align a downbeat grid by maximizing alignment with peaks.

---

## 8) Shader Plugin API (Creator SDK α)

**Uniform Block (WGSL)** every shader receives:
```wgsl
struct MusicUniforms {
  time: f32;         // seconds
  bpm: f32;
  beatPhase: f32;    // 0..1
  barPhase: f32;     // 0..1
  sectionIndex: u32;
  energy: f32;       // normalized 0..1 from analysis or RMS
};
@group(0) @binding(0) var<uniform> u: MusicUniforms;
```

**Module contract (TS)**
```ts
export interface VisualModule {
  id: string; // "particles.v1"
  params: Record<string, { default: number; min?: number; max?: number; step?: number }>;
  init(device: GPUDevice, format: GPUTextureFormat): Promise<{ pipeline: GPURenderPipeline; bindGroup: GPUBindGroup }>;
  render(ctx: {
    device: GPUDevice;
    view: GPUTextureView;
    uniforms: MusicUniforms;
    params: Record<string, number>;
    time: number;
    size: { width: number; height: number };
  }): void;
}
```

**Hot‑swap**: modules are ES modules; engine regenerates pipeline/bind group when switching.

---

## 9) Rooms & Sync (Realtime)

- **Transport**: WebRTC data channel between peers; coordination via edge (Durable Object / Redis). Fallback to WebSocket.
- **Clock**: Authoritative host time; guests compute skew via ping/offset (NTP‑like).  
- **Quantization**: Every UI action is stamped and scheduled to execute at the **next downbeat** to hide skew.
- **Messages**
```ts
type Msg =
 | { type: 'STATE'; trackId: string; t0: number; bpm: number; sectionIndex: number }
 | { type: 'ACTION'; action: 'toggleBloom'|'switchScene'|'paramDelta'; executeAt: number; payload?: any }
 | { type: 'PING'; ts: number }
 | { type: 'PONG'; ts: number };
```

---

## 10) Export (Clips)

**Client path (MVP):**
- Render to **OffscreenCanvas**; encode via **WebCodecs** (H.264/VP9) for 10–30s clips.  
- Upload to R2/S3, store `Clip` row. No audio for DRM sources; for local uploads, include audio via WebAudio capture + mux server‑side.

**Server path (V1):**
- Headless render (Node/WebGPU or Python) + **FFmpeg** for muxing, longer durations, and CRF control.

---

## 11) Local File Mode (DSP Notes)

- Decode via `AudioContext.decodeAudioData` or `MediaElementSource`.  
- Move DSP to **AudioWorkletProcessor** for XRuns protection.  
- Onset detection: spectral flux with half‑wave rectification and adaptive threshold.  
- Tempo estimation: autocorrelation over 30–240 BPM; choose peak; stabilize with median filter.  
- Emit Beat Bus events to main thread via `port.postMessage`.

---

## 12) API / Server Actions (Sketch)

- `POST /api/track/ingest` → parse link, fetch metadata, upsert `Track`.
- `POST /api/track/analyze` → (Spotify) fetch features/analysis; (local) store derived Beat Bus.
- `POST /api/room/create|join|leave`
- `POST /api/clip/export` → initiate client/server export; returns signed upload URL.
- Server Actions equivalents for Next.js app (preferred where possible).

---

## 13) Observability & Quality

- **OpenTelemetry** traces on Server Actions; **Sentry** for FE/BE errors.  
- **Playwright** E2E: paste‑link flow, Beat Bus determinism, room sync happy path.  
- **Vitest**: Beat Bus math (deterministic), parsing, reducers.  
- **Manual QA**: shader hot‑swap, FPS stability, quantization under 100–250ms skew.

---

## 14) Milestones (6 Weeks)

1. **Week 1 – Foundations**: Next.js app, Auth (NextAuth + Spotify), Prisma/Postgres, basic UI; ingest Spotify link + store analysis.
2. **Week 2 – Visual Engine v1**: Beat Bus from Spotify analysis; two shaders; section‑based camera cuts.
3. **Week 3 – Local Files**: upload, FFT/onsets/tempo → Beat Bus; AudioWorklet; UI toggle.
4. **Week 4 – Rooms**: create/join, host controls, beat‑quantized actions; basic clock sync.
5. **Week 5 – Clips**: OffscreenCanvas + WebCodecs capture; upload to storage; share link.
6. **Week 6 – Creator SDK α**: shader module API; gallery; save/load presets.

**Acceptance (MVP):**
- Paste Spotify link → visuals that cut on sections and pulse on downbeats.  
- Upload MP3 → visuals clearly lock to beat.  
- Two clients in a room see synchronized visual state.  
- Export 15s visual clip (no audio for Spotify).

---

## 15) Repo Structure (Monorepo)

```
/apps
  /web               # Next.js (App Router, RSC, Server Actions)
  /worker            # (opt) FastAPI container for heavy jobs
/packages
  /ui                # shared UI components (shadcn re-exports, primitives)
  /visuals           # shader modules + engine glue (TS + WGSL)
  /config            # tsconfig, eslint, prettier, tailwind presets
/infra
  /github            # Actions workflows
  /db                # Prisma schema & migrations
/docs
  /specs             # this file + ADRs
```

---

## 16) Setup (Local)

- Node 20+, pnpm, Python 3.11+ (optional worker).  
- `pnpm i`  
- Env: `DATABASE_URL`, `NEXTAUTH_SECRET`, `SPOTIFY_CLIENT_ID`/`SECRET`, storage creds.  
- `pnpm dev` (root) to run web app.  
- `pnpm prisma migrate dev` to init DB.  
- For WebGPU, use Chromium‑based browser with WebGPU enabled.

---

## 17) Example Code Snippets

**Beat Bus from Spotify (TS)**
```ts
export function buildBeatBus(analysis: any) {
  const beats = analysis.beats.map((b: any, i: number) => ({ t: b.start, index: i }));
  const barStarts = new Set(analysis.bars.map((b: any) => Math.round(b.start * 1000)));
  for (const b of beats) if (barStarts.has(Math.round(b.t * 1000))) b.isDownbeat = true;
  const sections = analysis.sections.map((s: any) => ({ start: s.start, duration: s.duration, confidence: s.confidence }));
  const tempo = analysis.track.tempo;
  function at(time: number) {
    let i = Math.max(0, beats.findIndex(e => e.t > time) - 1);
    while (i + 1 < beats.length && beats[i + 1].t <= time) i++;
    const beatIndex = Math.max(0, i);
    const beatStart = beats[beatIndex]?.t ?? 0;
    const nextStart = beats[beatIndex + 1]?.t ?? (beatStart + 60 / tempo);
    const beatPhase = Math.min(1, Math.max(0, (time - beatStart) / (nextStart - beatStart)));
    let sectionIndex = 0;
    for (let s = 0; s < sections.length; s++) if (time >= sections[s].start) sectionIndex = s; else break;
    // Approximate bar phase as last downbeat interval
    let barStart = beatStart; let barEnd = nextStart;
    for (let k = beatIndex; k >= 0; k--) if (beats[k].isDownbeat) { barStart = beats[k].t; break; }
    for (let k = beatIndex + 1; k < beats.length; k++) if (beats[k].isDownbeat) { barEnd = beats[k].t; break; }
    const barPhase = Math.min(1, Math.max(0, (time - barStart) / (barEnd - barStart)));
    return { beatIndex, beatPhase, barPhase, sectionIndex };
  }
  return { tempo, beats, sections, at };
}
```

**WGSL Uniform**
```wgsl
struct MusicUniforms {
  time: f32;
  bpm: f32;
  beatPhase: f32;
  barPhase: f32;
  sectionIndex: u32;
  energy: f32;
};
@group(0) @binding(0) var<uniform> u: MusicUniforms;
```

**GitHub Actions skeleton (CI)**
```yaml
name: ci
on: [push, pull_request]
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm i --frozen-lockfile
      - run: pnpm -w build
      - run: pnpm -w test
```

---

## 18) Suggested `.cursorrules` (optional)

Create a file named `.cursorrules` with the following content to steer AI assistants toward this architecture and style:

```md
# Cursor Rules for Cross-Source Music Visualizer

## Voice & Priorities
- Assume 2025 web platform (WebGPU, WebCodecs, AudioWorklet) is available.
- Never propose DRM circumvention. Prefer metadata/time-driven visuals.
- Favor determinism: every visual effect must be driven by the Beat Bus.

## Stack Preferences
- Next.js (App Router) + Server Actions. TS everywhere.
- Postgres + Prisma; Redis (Upstash) for presence; R2/S3 for clips.
- WebGPU (WGSL) for visuals. Tailwind + shadcn/ui for UI.

## Code Style
- Strict TypeScript, ESLint, Prettier. Functional, small modules.
- Rely on Zod for API payloads. No `any`. Use discriminated unions for messages.

## Architectural Conventions
- All visual modules receive the same uniform block (time, bpm, beatPhase, barPhase, sectionIndex, energy).
- Beat Bus is the single source of truth for timing. UI actions quantize to next downbeat.
- No business logic in React components; use hooks and services.
```

---

## 19) Future Work (V1+)

- Apple Music integration, YouTube time‑driven choreography improvements
- Shader marketplace with moderation and sandboxing
- Smart lights/haptics; MIDI/OSC input for VJ controllers
- Stem‑aware visuals for local files
- Stripe for Pro tier (longer exports, creator marketplace benefits)
- Desktop live wallpaper export

---

## 20) Success Metrics

- **Time‑to‑first‑visual** < 15s after pasting a link.
- **Beat lock accuracy**: downbeat error < 60ms (local mode).
- **Room drift**: < ±80ms over 5 minutes.
- **Clip export reliability**: > 98% success for 15s clips.

---

## 21) Glossary

- **Beat Bus**: a deterministic timeline of musical events (beats/bars/sections) that drives all visuals and quantized UI.
- **Quantization**: scheduling actions to land on musical grid (next beat/downbeat).
- **Downbeat**: first beat of a bar.
- **WGSL**: WebGPU Shading Language.
```

