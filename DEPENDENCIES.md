# x-src Dependencies Guide

This document outlines all the dependencies needed for the x-src music tools hub.

## 🏗️ Core Dependencies

### Root Workspace
- **pnpm** - Package manager for the monorepo
- **turbo** - Build system for the monorepo
- **typescript** - Type checking and compilation

### Database & ORM
- **@prisma/client** - Database client
- **prisma** - Database schema management and migrations
- **@auth/prisma-adapter** - NextAuth.js adapter for Prisma

### Authentication
- **next-auth** - Authentication framework for Next.js

### Web Framework
- **next** - React framework with App Router
- **react** - UI library
- **react-dom** - React DOM rendering

## 📦 Package Dependencies

### @x-src/core
- **zod** - Schema validation and type inference

### @x-src/sources
- **@x-src/core** - Internal dependency on core types
- **zod** - Schema validation

### @x-src/visuals
- **@x-src/core** - Internal dependency on core types
- **zod** - Schema validation

### @x-src/ui
- **@x-src/core** - Internal dependency on core types
- **react** - React components
- **react-dom** - React DOM
- **class-variance-authority** - Component variant management
- **clsx** - Conditional CSS classes
- **tailwind-merge** - Tailwind CSS class merging
- **lucide-react** - Icon library

### @x-src/config
- **@typescript-eslint/eslint-plugin** - TypeScript ESLint rules
- **@typescript-eslint/parser** - TypeScript ESLint parser
- **eslint** - Code linting
- **eslint-config-prettier** - Prettier ESLint config
- **eslint-plugin-react** - React ESLint rules
- **eslint-plugin-react-hooks** - React Hooks ESLint rules
- **prettier** - Code formatting
- **tailwindcss** - CSS framework
- **typescript** - TypeScript compiler

### @x-src/web (Main App)
- **@x-src/core** - Core types and utilities
- **@x-src/sources** - Source adapters
- **@x-src/visuals** - WebGPU engine
- **@x-src/ui** - UI components
- **@prisma/client** - Database client
- **@auth/prisma-adapter** - NextAuth adapter
- **next-auth** - Authentication
- **zod** - Schema validation
- **class-variance-authority** - Component variants
- **clsx** - CSS classes
- **tailwind-merge** - Tailwind merging
- **lucide-react** - Icons
- **@radix-ui/react-slot** - Radix UI primitives
- **@radix-ui/react-dialog** - Dialog component
- **@radix-ui/react-dropdown-menu** - Dropdown menu
- **@radix-ui/react-tabs** - Tabs component
- **@radix-ui/react-toast** - Toast notifications
- **@radix-ui/react-tooltip** - Tooltip component
- **tailwindcss-animate** - Tailwind animations

## 🔧 Development Dependencies

### Root
- **@types/node** - Node.js type definitions
- **prettier** - Code formatting
- **turbo** - Build system
- **typescript** - TypeScript compiler

### Packages
- **@types/node** - Node.js types
- **eslint** - Linting
- **tsup** - TypeScript bundler
- **typescript** - TypeScript compiler

### Web App
- **@types/node** - Node.js types
- **@types/react** - React types
- **@types/react-dom** - React DOM types
- **eslint** - Linting
- **eslint-config-next** - Next.js ESLint config
- **prisma** - Database tools
- **tailwindcss** - CSS framework
- **typescript** - TypeScript compiler

## 🚀 Installation Commands

### Initial Setup
```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Generate Prisma client
pnpm db:generate
```

### Development
```bash
# Start development server
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Build for production
pnpm build
```

## 🌐 External Services Required

### Database
- **PostgreSQL** - Primary database (Neon, Supabase, or self-hosted)

### Caching & Presence
- **Redis** - Session storage and real-time features (Upstash recommended)

### Storage
- **R2/S3** - File storage for clips and assets

### APIs
- **Spotify API** - Music metadata and analysis
- **Apple Music API** - Music metadata (optional)
- **YouTube Data API** - Video metadata (optional)

## 📱 Browser Support

### Required Features
- **WebGPU** - For visual rendering (Chrome 113+, Edge 113+)
- **Web Audio API** - For audio processing
- **AudioWorklet** - For real-time audio analysis
- **WebCodecs** - For video encoding (Chrome 94+)

### Fallbacks
- **WebGL 2.0** - Fallback for older browsers
- **Canvas API** - Basic rendering fallback

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env.local` files
- Use strong secrets for NextAuth
- Rotate API keys regularly

### API Keys
- Spotify: Client ID + Secret
- Apple Music: Key ID + Team ID + Private Key
- R2/S3: Access Key + Secret Key

### CORS & CSP
- Configure proper CORS headers
- Set up Content Security Policy
- Validate all user inputs

## 📊 Performance Dependencies

### Build Optimization
- **Turborepo** - Incremental builds
- **tsup** - Fast TypeScript bundling
- **pnpm** - Efficient package management

### Runtime Performance
- **WebGPU** - Hardware-accelerated rendering
- **AudioWorklet** - Non-blocking audio processing
- **WebCodecs** - Hardware video encoding

## 🔄 Update Strategy

### Regular Updates
- **Security patches** - Weekly
- **Feature updates** - Monthly
- **Major versions** - Quarterly

### Dependency Health
- Use `pnpm outdated` to check for updates
- Monitor security advisories
- Test updates in development before production

## 🐛 Troubleshooting

### Common Issues
1. **WebGPU not available** - Check browser support
2. **Prisma connection** - Verify DATABASE_URL
3. **Build errors** - Clear node_modules and reinstall
4. **Type errors** - Run `pnpm type-check`

### Debug Commands
```bash
# Check package versions
pnpm list

# Verify workspace setup
pnpm why <package>

# Clean and reinstall
pnpm clean && pnpm install
```
