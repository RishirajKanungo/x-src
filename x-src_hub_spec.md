# x‑src — Music Tools Hub (2025) — Product & Engineering Spec

Author: Rishiraj Kanungo
Audience: Future you, collaborators, and Cursor AI (as project context).  
Scope: Hub + first two apps (Visualizer, Clips Studio) for MVP; Mini‑DAW (Local) for V1.

---

## 0) Vision

**x‑src** is a **hub** of modern, web‑native music tools that run in the browser, showcase cutting‑edge 2025 tech, and respect platform policies.  
Start with two sticky apps:

1. **x‑src Visualizer** — structure‑aware, beat‑synced visuals from Spotify/YouTube/Apple links or local files.
2. **x‑src Clips Studio** — create beat‑aligned visual clips (10–30s) for social. Audio only on user‑uploaded files.

Then expand with: 3) **x‑src Mini‑DAW (Local)** — minimal browser DAW for **local uploads/public‑domain** content; automation lanes; no DRM streams mixed.  
4) **x‑src Showrunner (VJ/DJ)** — live controls quantized to beat; rooms for synchronized sessions.  
5) **x‑src Analyzer/Tagger** — compute features (tempo/key/energy), section detection, loudness; batch tag local library.  
6) **x‑src Practice/Trainer** — loop sections; tempo shift; metronome guided by detected BPM; ear‑training widgets.  
7) **x‑src Lights & Haptics** — optional Hue/LIFX bridges and controller rumble synced to downbeats.  
8) **x‑src Storyboards** — auto “music‑video” shot list from sections for content creators.

**Why a hub?** Shared login, shared library (tracks/analyses/scenes), shared “Beat Bus,” and a **plugin marketplace** for shader packs and utilities → compounding value and network effects.

---

## 1) Compliance & Source Capability Matrix

We never bypass DRM. Capabilities are explicitly gated per source.

| Source        | Playback in browser | Raw PCM | Official analysis             | Time & seek | Export with audio      |
| ------------- | ------------------- | ------- | ----------------------------- | ----------- | ---------------------- |
| Spotify (Web) | Yes (Premium, DRM)  | No      | Yes (Audio Analysis/Features) | Yes         | **No** (DRM)           |
| YouTube       | Yes (IFrame)        | No      | No (use heuristics/time)      | Yes         | **No** (DRM)           |
| Apple Music   | Yes (MusicKit)      | No      | Limited (metadata/time)       | Yes         | **No** (DRM)           |
| Local files   | Yes                 | **Yes** | We compute locally            | Yes         | **Yes** (user content) |

**Design rule:** If a feature needs PCM or re‑muxed audio, it is **Local‑Only** (user uploads or public‑domain content).

---

## 2) Architecture (Hub + Apps)

### High‑Level

```
[Next.js App (x-src)] --------------------+--- [App: Visualizer]
  App Router, RSC, Server Actions         +--- [App: Clips Studio]
  TypeScript, Tailwind/shadcn             +--- [App: Mini-DAW (Local, V1)]
  Shared: Beat Bus, Source Adapters       +--- [App: Showrunner (Rooms)]
                                          +--- [App: Analyzer/Tagger]
WebGPU (WGSL) | Web Audio | ONNX WebGPU
        |
Edge Functions (Vercel/CF Workers) ---- Postgres(Prisma) / Redis(Upstash) / R2|S3
        |
(Optional) Python FastAPI worker ---- Celery/Queues ---- FFmpeg / headless render
```

### Monorepo Structure

```
/apps
  /web            # Next.js hub + apps (routes under /apps/*)
  /worker         # (optional) FastAPI media jobs (stems, long renders)
/packages
  /core           # shared types, Beat Bus, timing utilities, feature flags
  /sources        # source adapters (spotify, youtube, apple, local)
  /visuals        # WebGPU engine + shader modules (plugin API)
  /ui             # design system components (shadcn wrappers)
  /audio-dsp      # WASM/Worklet DSP utilities (onset, tempo, RMS, key est.)
  /config         # tsconfig/eslint/prettier/tailwind presets
/docs
  /specs          # specs (this file, app-specific specs)
```

### Core Abstractions

```ts
// packages/core/src/types.ts
export type TrackSource = "spotify" | "youtube" | "apple" | "local";

export interface TrackHandle {
  id: string; // internal id
  source: TrackSource;
  sourceId: string; // provider id or "local:<hash>"
  title: string;
  artist: string;
  durationMs: number;
  isrc?: string;
}

export interface Analysis {
  tempo?: number;
  key?: number;
  energy?: number;
  loudness?: number;
  beats?: { t: number; isDownbeat?: boolean }[];
  bars?: { t: number }[];
  sections?: { start: number; duration: number; label?: string }[];
}

export interface BeatSnapshot {
  beatIndex: number;
  beatPhase: number; // 0..1
  barPhase: number; // 0..1
  sectionIndex: number;
}
```

```ts
// packages/sources/src/adapter.ts
export interface SourceCapabilities {
  playback: boolean;
  pcm: boolean;
  officialAnalysis: boolean;
  allowAudioExport: boolean;
}

export interface ISourceAdapter {
  kind: TrackSource;
  capabilities: SourceCapabilities;
  parseUrl(url: string): Promise<{ sourceId: string } | null>;
  fetchMetadata(sourceId: string): Promise<TrackHandle>;
  fetchAnalysis?(sourceId: string): Promise<Analysis>; // Spotify only
  getPlaybackElement(opts): Promise<HTMLIFrameElement | HTMLAudioElement>; // DRM-safe
}
```

**Beat Bus** lives in `packages/core` and is the single timing truth used by all apps.

---

## 3) App Catalog

### A) x‑src Visualizer (MVP)

- Paste link → ingest track → render beat/section-aware visuals.
- WebGPU shader packs; section-based camera choreography.
- Rooms for synchronized viewing; quantized actions.
- **Exports:** visual‑only clips (10–30s) via WebCodecs (no DRM audio).
- **Local Mode:** full FFT & RMS/energy, optional audio‑in clip export.

### B) x‑src Clips Studio (MVP)

- Timeline of a chosen segment; choose shader preset; overlay titles/captions.
- Quantized in/out points to beats; handles aspect ratios.
- Export to MP4/WebM; upload to R2/S3; share link.
- **Compliance:** no original audio for DRM sources; audio allowed for local uploads.

### C) x‑src Mini‑DAW (Local, V1)

- Local‑only tracks/stems with gain/pan, basic EQ, and automation lanes.
- Metronome and tempo‑sync to Beat Bus.
- Render/mix down via OfflineAudioContext or server FFmpeg.
- (For linked DRM tracks: show **ghost lanes** for automation/markers only—no audio mixing.)

### D) x‑src Showrunner (VJ/DJ, V1)

- MIDI/OSC input (optional), on‑screen pads; actions quantized to downbeats.
- Collaborative rooms; host clock with skew correction.
- Smart lights/haptics bridges (user‑opt‑in, local network).

### E) x‑src Analyzer/Tagger (V1)

- Batch analyze local files; compute tempo/key/energy/sections; write tags.
- Export CSV/JSON for DJs and ML workflows.

### F) x‑src Practice/Trainer (V1)

- Loop sections; slow down/speed up; metronome; ear‑training widgets.

### G) x‑src Storyboards (V1+)

- Auto shot‑list for creators based on sections (intro/verse/chorus/bridge/outro).

---

## 4) Database (Prisma sketch)

```prisma
model User {
  id        String  @id @default(cuid())
  email     String  @unique
  spotifyId String? @unique
  appleId   String? @unique
  createdAt DateTime @default(now())
  scenes    Scene[]
  clips     Clip[]
}

model Track {
  id         String  @id @default(cuid())
  source     TrackSource
  sourceId   String
  isrc       String?
  title      String
  artist     String
  durationMs Int
  analysis   Analysis?
  createdAt  DateTime @default(now())
}

enum TrackSource { spotify youtube apple local }

model Analysis {
  trackId   String  @id
  track     Track   @relation(fields: [trackId], references: [id])
  tempo     Float?
  key       Int?
  energy    Float?
  loudness  Float?
  beats     Json?
  bars      Json?
  sections  Json?
}

model Scene {
  id         String  @id @default(cuid())
  userId     String
  user       User    @relation(fields: [userId], references: [id])
  name       String
  shaderPack String
  params     Json
  isPublic   Boolean @default(false)
  createdAt  DateTime @default(now())
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

## 5) Routing & UX (Next.js)

```
/app
  /(marketing)/page.tsx           # Landing: brand, demos, paste link CTA
  /dashboard/page.tsx             # Library of tracks, scenes, clips
  /apps/visualizer/page.tsx       # Visualizer app
  /apps/clips/page.tsx            # Clips Studio
  /apps/minidaw/page.tsx          # Local-only in V1
  /rooms/[id]/page.tsx            # Synced viewing
  /api/* or Server Actions        # Ingest, analyze, clips, rooms
```

- **Top Nav:** x‑src logo + App switcher + “Paste link” omnibar.
- **Left Rail:** Library (Tracks, Scenes, Clips).
- **Right Panel (Visualizer):** VJ controls, quantized toggles, shader params.
- **Clips Studio:** simple timeline with beat grid, start/end handles snap to beats.

---

## 6) Shared Timing: Beat Bus

- Source‑aware: Spotify uses official beats/bars/sections; others use time + heuristics; Local uses DSP.
- API: `beatBus.at(playbackTime)` → `{ beatPhase, barPhase, sectionIndex }`.
- All apps read from the same Beat Bus; UI actions schedule to **next downbeat**.

WGSL uniform (shared across shaders):

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

---

## 7) Tech Stack (Hiring‑friendly 2025)

- **Next.js (App Router), RSC, Server Actions**, **TypeScript**
- **Tailwind + shadcn/ui**, **Zod** for validation
- **WebGPU (WGSL)**, **Web Audio + AudioWorklet**, **WebCodecs**
- **ONNX Runtime Web (WebGPU EP)** for lightweight ML (onset/hype detection)
- **Postgres (Neon/Supabase) + Prisma**, **Redis (Upstash)**, **Object Storage (R2/S3)**
- **Edge** (Vercel/CF Workers) + **Durable Objects** (or Redis channels) for rooms
- **Python FastAPI** worker for optional heavy jobs
- **OpenTelemetry + Sentry**, **Playwright/Vitest/Jest**, **GitHub Actions**, **Turborepo + pnpm**

---

## 8) MVP Plan (Hub + 2 apps) — 6 Weeks

1. **Week 1 — Hub & Auth**
   - App shell, App switcher, Postgres/Prisma, NextAuth (email + Spotify).
   - Link parser (+ source detection), Track ingest, Track library.
2. **Week 2 — Visualizer v1**
   - Spotify analysis → Beat Bus; 2 shader packs; section‑based camera cuts.
3. **Week 3 — Local Mode**
   - Upload; AudioWorklet onset/tempo; RMS/energy; Beat Bus parity with Spotify.
4. **Week 4 — Rooms (Showrunner core)**
   - Create/join room; host clock; quantized actions; basic VJ panel.
5. **Week 5 — Clips Studio**
   - Beat‑snapped in/out; OffscreenCanvas + WebCodecs; upload to R2/S3; share link.
6. **Week 6 — Polish & Creator SDK α**
   - Shader plugin API; preset save/load; gallery. Observability, perf, CI pass.

**Exit criteria (MVP):**

- Paste Spotify link → section‑aware visuals.
- Upload MP3 → clearly beat‑locked visuals.
- Two users in a room see synchronized visuals and quantized triggers.
- Export 15s visual‑only clip.

---

## 9) Getting Started (Tonight)

- Create repo `x-src` (Turborepo).
- Add `apps/web`, `packages/core`, `packages/sources`, `packages/visuals`, `packages/ui`, `packages/config`.
- Implement **SourceAdapter** for Spotify (parse URL, fetch metadata & analysis).
- Build **Beat Bus** and **two shaders** (bars + particles).
- Scaffold **Clips Studio** page with fake timeline and beat snapping (use Beat Bus).

---

## 10) Suggested `.cursorrules` (Hub‑aware)

> See file `.cursorrules` in repo root (generated by this spec).

Key points:

- Prefer **Server Actions** over ad‑hoc API routes when possible.
- Never propose DRM bypass; gate features by `SourceCapabilities`.
- All visuals read from Beat Bus; UI actions quantize to next downbeat.
- Default to WebGPU (WGSL) for visuals; Tailwind/shadcn for UI.
- Use Zod schemas and discriminated unions for messages.

---

## 11) Success Metrics

- TTFV (time‑to‑first‑visual) < **15s** after paste.
- Downbeat error (local) < **60ms**.
- Room drift < **±80ms** over 5 minutes.
- Clip export success > **98%** for 15s clips.

---

## 12) Appendix — Example Interfaces

**ISourceAdapter (TS)**

```ts
export interface ISourceAdapter {
  kind: "spotify" | "youtube" | "apple" | "local";
  capabilities: {
    playback: boolean;
    pcm: boolean;
    officialAnalysis: boolean;
    allowAudioExport: boolean;
  };
  parseUrl: (url: string) => Promise<{ sourceId: string } | null>;
  fetchMetadata: (sourceId: string) => Promise<TrackHandle>;
  fetchAnalysis?: (sourceId: string) => Promise<Analysis>;
  getPlaybackElement: (opts: {
    sourceId: string;
    auth?: any;
  }) => Promise<HTMLIFrameElement | HTMLAudioElement>;
}
```

**Beat Bus “at” contract**

```ts
const snap = beatBus.at(currentTime);
engine.setUniforms({
  time: currentTime,
  bpm: beatBus.tempo ?? estimate,
  beatPhase: snap.beatPhase,
  barPhase: snap.barPhase,
  sectionIndex: snap.sectionIndex,
  energy: currentEnergy,
});
```

---

## 13) Naming & Branding

- Project: **x‑src** (read: “cross‑source”).
- App prefixes: **x‑src Visualizer**, **x‑src Clips**, **x‑src Mini‑DAW**, **x‑src Showrunner**, etc.
- Visual identity: dark theme, crisp mono font for tech feel; particle motif.

---

## 14) Roadmap Beyond MVP

- Apple Music adapter, improved YouTube time‑driven choreography.
- Shader marketplace with sandboxing & moderation.
- Smart lights and haptics bridges.
- Stem‑aware visuals for local files (V1), Pro tier for long exports.
- Desktop live wallpaper exporter.
- Analyzer batch mode with CSV/JSON export.
- Practice/Trainer widgets.

---
