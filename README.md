# x-src — Cross-Source Music Tools Hub

Modern web-native music tools with WebGPU, beat-synced visuals, and cross-platform source support.

## 🎯 Vision

**x-src** is a **hub** of modern, web-native music tools that run in the browser, showcase cutting-edge 2025 tech, and respect platform policies.

### Core Apps

1. **x-src Visualizer** — Structure-aware, beat-synced visuals from Spotify/YouTube/Apple links or local files
2. **x-src Clips Studio** — Create beat-aligned visual clips (10–30s) for social media
3. **x-src Mini-DAW (Local)** — Minimal browser DAW for local uploads (V1)
4. **x-src Showrunner** — Live VJ/DJ controls quantized to beat (V1)

## 🏗️ Architecture

- **Monorepo** with Turborepo + pnpm
- **Next.js App Router** + Server Actions + TypeScript
- **WebGPU (WGSL)** for rendering + **Web Audio** + **AudioWorklet**
- **Postgres + Prisma** + **Redis (Upstash)** + **R2/S3** storage
- **Shared Beat Bus** — single timing truth for all apps

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- PostgreSQL database
- Redis (Upstash recommended)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo>
   cd x-src
   pnpm install
   ```

2. **Set up environment:**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Set up database:**
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

4. **Start development:**
   ```bash
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 📁 Project Structure

```
x-src/
├── apps/
│   └── web/                 # Next.js hub + apps
│       ├── src/app/         # App Router pages
│       ├── prisma/          # Database schema
│       └── package.json
├── packages/
│   ├── core/                # Types, Beat Bus, utilities
│   ├── sources/             # Source adapters (Spotify, YouTube, etc.)
│   ├── visuals/             # WebGPU engine + shaders
│   ├── ui/                  # Design system components
│   └── config/              # Shared configs (TS, ESLint, Tailwind)
├── turbo.json               # Turborepo config
└── package.json             # Root workspace
```

## 🔌 Source Capabilities

| Source        | Playback | Raw PCM | Analysis | Export |
|---------------|----------|---------|----------|---------|
| Spotify       | ✅ DRM   | ❌      | ✅ Official | ❌ DRM |
| YouTube       | ✅ IFrame| ❌      | ❌ Heuristic| ❌ DRM |
| Apple Music   | ✅ MusicKit| ❌    | ❌ Limited | ❌ DRM |
| Local Files   | ✅       | ✅      | ✅ Local   | ✅     |

**Design rule:** PCM features are **Local-Only** (user uploads or public-domain content).

## 🎵 Beat Bus

The **Beat Bus** is the single timing truth used by all apps:

```ts
import { beatBus } from '@x-src/core';

const snap = beatBus.at(currentTime);
// Returns: { beatPhase, barPhase, sectionIndex, bpm }
```

All UI actions schedule to **next downbeat** for quantized behavior.

## 🎨 WebGPU Shaders

Shader packs receive music uniforms:

```wgsl
struct MusicUniforms {
  time: f32;
  bpm: f32;
  beatPhase: f32;
  barPhase: f32;
  sectionIndex: u32;
  energy: f32;
};
```

## 🛠️ Development

### Commands

```bash
# Build all packages
pnpm build

# Development mode
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Database
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema changes
pnpm db:studio      # Open Prisma Studio
```

### Adding New Sources

1. Create adapter in `packages/sources/src/adapters/`
2. Extend `BaseSourceAdapter`
3. Implement required methods
4. Add to `SourceManager`

### Adding New Shaders

1. Create shader pack in `packages/visuals/src/shaders/`
2. Implement vertex/fragment shaders
3. Add to shader registry
4. Test with Beat Bus integration

## 🌐 Deployment

### Vercel (Recommended)

1. Connect repository
2. Set environment variables
3. Deploy automatically

### Self-hosted

1. Build: `pnpm build`
2. Start: `pnpm start`
3. Set `NODE_ENV=production`

## 📊 Performance Targets

- **TTFV** (time-to-first-visual) < 15s after paste
- **Downbeat error** (local) < 60ms
- **Room drift** < ±80ms over 5 minutes
- **Clip export success** > 98% for 15s clips

## 🔮 Roadmap

### MVP (6 weeks)
- [x] Hub & Auth
- [ ] Visualizer v1
- [ ] Local Mode
- [ ] Rooms (Showrunner core)
- [ ] Clips Studio
- [ ] Polish & Creator SDK α

### V1+
- [ ] Apple Music adapter
- [ ] Shader marketplace
- [ ] Smart lights/haptics
- [ ] Stem-aware visuals
- [ ] Practice/Trainer widgets

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Follow coding standards (strict TS, ESLint, Prettier)
4. Add tests for new functionality
5. Submit pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

## 🙏 Acknowledgments

- WebGPU Working Group
- Next.js team for App Router
- Prisma team for excellent ORM
- Turborepo for monorepo tooling

---

Built with ❤️ by [Rishiraj Kanungo](https://github.com/rishirajkanungo)