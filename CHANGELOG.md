# Changelog

All notable changes to the Portfolio Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [2.0.0] — 2025-01-15

### Added

#### Infrastructure (Epic 1)
- PostgreSQL 16 database with Drizzle ORM and auto-generated Zod schemas
- Redis 7 caching layer with write-through invalidation strategy
- BullMQ email queue for contact form notifications and admin replies
- Pino structured JSON logging with request tracing (X-Request-ID)
- Sentry error tracking and Node.js profiling integration
- Express rate limiting (global + per-endpoint)
- Graceful shutdown with in-flight request completion
- Database health checks with Neon cold-start handling (15s timeout)

#### Authentication & Security (Epic 2)
- JWT-based admin authentication (15-min access + 7-day refresh tokens)
- Redis-backed token blacklist with auto-expiry
- CSRF protection via non-httpOnly cookie
- bcrypt + constant-time comparison password validation
- Brute-force mitigation (5 attempts/15 min + 1s delays)
- Helmet security headers and CORS origin whitelist
- Input sanitization via DOMPurify (messages, articles)
- Honeypot spam detection for contact form

#### Content Management (Epic 3)
- Full CRUD for projects, skills, articles, experiences, testimonials, mindsets, services
- Rich text editor (TipTap/ProseMirror) with code highlighting
- Cloudinary image upload with optimization
- Article system with slugs, status workflow (draft/published), related articles
- Skill tree with node connections and interactive SVG visualization
- Audit logging for all admin mutations
- SEO settings management per page
- Email template CRUD with variable interpolation
- Bulk operations (delete, status update, reorder)
- Portfolio service management

#### Frontend Experience (Epic 4)
- React 19 SPA with wouter routing and TanStack Query
- PWA with offline support (Workbox runtime caching)
- Three.js Plexus animated background (theme-aware)
- Framer Motion page transitions and section animations
- Responsive admin dashboard with sidebar navigation
- Blog with search, filtering, and view count tracking
- Project detail pages with tech stack badges
- Interactive skill tree SVG with hover highlighting
- AI chatbot with OpenRouter integration
- Web Vitals reporting to analytics API
- Recharts-powered analytics dashboard

#### Testing & Quality (Epic 5)
- Automated API testing via vitest (refer to test suite for exact count)
- Frontend component testing setup
- Integration tests for API endpoints
- e2e accessibility tests via Playwright + axe-core
- Vitest with coverage reporting (@vitest/coverage-v8)
- Automated Lighthouse CI assertions

#### Polish & Accessibility (Epic 6)
- HSL + hex-based CSS custom property system for dark/light themes
- ThemeToggle component with system preference detection
- Centralized animation token system (`animation.ts`) with 15+ presets
- `withReducedMotion()` helper respecting `prefers-reduced-motion`
- `viewport-fit=cover` for notched device support
- `touch-action: manipulation` removing 300ms tap delay
- Safe-area-inset support for chatbot on notched phones
- 44px minimum touch targets for admin sidebar navigation
- Mobile-optimized SkillsListView (categorized, expandable, accessible)
- ARCHITECTURE.md, RUNBOOK.md, and CHANGELOG.md documentation

### Changed
- Migrated from MySQL to PostgreSQL 16
- Replaced inline Framer Motion values with centralized animation tokens
- Extended CSS variable system with 16+ new custom properties
- PlexusBackground adapts to dark/light theme

### Fixed
- Font-display swap preventing FOUT (Flash of Unstyled Text)
- Zod v3/v4 TDZ bundling issues (esbuild over Terser)
- Neon cold-start connection failures (15s timeout)
- Admin chunk preloading on public pages (modulePreload filtering)

---

## [1.0.0] — 2024-06-01

### Added
- Initial portfolio website
- Basic project showcase
- Contact form
- Static skill display
