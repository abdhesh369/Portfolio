# Product Requirements Document (PRD)
## Abdhesh Sah — Portfolio Platform v2.0

> **Document Status:** In Development — Epic 3 In Progress  
> **Last Updated:** March 4, 2026  
> **Stack:** React 19 · Express · PostgreSQL · Redis · BullMQ  
> **Goal:** Transform a strong v1 portfolio into a production-grade, fully tested, observable, accessible platform

---

## Table of Contents

1. [Overview](#1-overview)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [User Personas](#3-user-personas)
4. [Epics & Features](#4-epics--features)
   - [Epic 1 — Critical Bug Fixes](#epic-1--critical-bug-fixes)
   - [Epic 2 — Testing Infrastructure](#epic-2--testing-infrastructure)
   - [Epic 3 — Architecture Improvements](#epic-3--architecture-improvements)
   - [Epic 4 — Infrastructure & Observability](#epic-4--infrastructure--observability)
   - [Epic 5 — Feature Enhancements](#epic-5--feature-enhancements)
   - [Epic 6 — Polish & Accessibility](#epic-6--polish--accessibility)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Technical Constraints](#6-technical-constraints)
7. [Release Plan](#7-release-plan)
8. [Definition of Done](#8-definition-of-done)
9. [Risk Register](#9-risk-register)
10. [Out of Scope](#10-out-of-scope)

---

## 1. Overview

### Background

The portfolio is a full-stack personal site featuring a cyberpunk-themed UI, an AI chatbot, a blog, a skills visualization tree, project showcases, and a full CMS admin dashboard. The v1 codebase demonstrates strong architectural thinking — shared Zod schemas, Redis caching, BullMQ email queue, and JWT token blacklisting — but has critical bugs in production, near-zero test coverage, and missing observability that prevent it from being called production-grade.

### Problem Statement

1. **Draft articles are publicly exposed** due to a silent Drizzle ORM filter bug
2. **Zero meaningful test coverage** means every future change is a regression risk
3. **No error visibility** — production exceptions disappear with no alerting
4. **Not portable** — tightly coupled to Render's runtime with no containerization
5. **Accessibility gaps** prevent a significant portion of users from using the site
6. **Missing PWA and advanced SEO** leave performance and discoverability on the table

### Vision

> A portfolio that any senior engineer at any company looks at and says: *"This person knows what they are doing."*

---

## 2. Goals & Success Metrics

### Primary Goals

| Goal | Metric | Target |
|------|--------|--------|
| Zero critical bugs in production | Open P0/P1 issues | 0 |
| Meaningful test coverage | Line coverage on critical paths | ≥ 90% |
| Fast, reliable user experience | Lighthouse Performance score | ≥ 95 |
| Accessible to all users | Lighthouse Accessibility score | 100 |
| Visible errors in production | Time to detect unhandled exceptions | < 1 min (Sentry) |
| Portable deployment | Environments runnable via Docker | Local + CI + Prod |
| SEO excellence | Google rich result eligibility | JSON-LD validated |
| PWA installable | Lighthouse PWA score | 100 |

### Secondary Goals

- Admin dashboard real-time message notifications
- Blog full-text search
- Core Web Vitals tracked over time
- Complete developer documentation

---

## 3. User Personas

### Persona 1 — The Recruiter / Hiring Manager
**Goal:** Quickly assess skills, experience, and communication quality  
**Frustration:** Slow load times, broken pages, inaccessible UI  
**Needs:** Fast first load, clear project descriptions, working contact form, downloadable CV

### Persona 2 — The Senior Engineer (Technical Interviewer)
**Goal:** Evaluate code quality, architecture decisions, depth of knowledge  
**Frustration:** No visible tests, no documentation, security red flags  
**Needs:** Clean repo, test coverage, ARCHITECTURE.md, observable codebase, secure admin

### Persona 3 — The Blog Reader
**Goal:** Read technical articles and learn  
**Frustration:** No search, no reading progress, broken related articles  
**Needs:** Fast article load, reading progress bar, table of contents, article search

### Persona 4 — The Admin (Abdhesh)
**Goal:** Manage content — projects, articles, messages, skills — from anywhere  
**Frustration:** No real-time notifications, no unsaved-changes warning, no audit trail  
**Needs:** Real-time inbox, audit log, optimistic UI, export capabilities

---

## 4. Epics & Features

---

### Epic 1 — Critical Bug Fixes ✅ COMPLETE

> **Priority:** P0 — Must ship before any other work  
> **Timeline:** Week 1–2  
> **Owner:** Backend + Frontend  
> **Status:** All 7 tickets shipped. Zero compile errors.

---

#### TICKET-001 — Fix Drizzle ORM Silent Filter Bug

**Priority:** P0  
**Effort:** S (2 hours)  
**File:** `Backend/src/repositories/article.repository.ts`

**Problem:**  
`query.where()` returns a new query builder — it does not mutate in place. The returned value is discarded, so the status filter is silently ignored. All articles (including drafts) are returned for every call to `getAll()`.

**Acceptance Criteria:**
- [x] `getAll("published")` returns only articles with `status = 'published'`
- [x] `getAll("draft")` returns only draft articles
- [x] `getAll()` with no argument returns all articles
- [x] Unit test added: `findAll(status)` with published/draft/undefined cases
- [x] Sitemap endpoint no longer includes draft articles
- [x] RSS feed no longer includes draft articles

**Implementation:**
```ts
// BEFORE
const query = db.select().from(articlesTable);
if (status) {
    query.where(eq(articlesTable.status, status as any)); // discarded
}

// AFTER
const baseQuery = status
    ? db.select().from(articlesTable).where(eq(articlesTable.status, status as any))
    : db.select().from(articlesTable);
const results = await baseQuery.orderBy(
    desc(articlesTable.publishedAt),
    desc(articlesTable.createdAt)
);
```

---

#### TICKET-002 — Fix CDN-Cacheable Draft Exposure ✅

**Priority:** P0  
**Effort:** S (1 hour)  
**File:** `Backend/src/routes/articles.ts`

**Problem:**  
`cachePublic(300)` sets `Cache-Control: public, max-age=300` as middleware before auth runs. A CDN or browser can cache the response containing draft articles.

**Acceptance Criteria:**
- [x] Admin requests to `/api/articles` receive `Cache-Control: no-store`
- [x] Public requests to `/api/articles` receive `Cache-Control: public, max-age=300`
- [x] Header is set inside the handler after auth is determined — never from middleware for this route
- [x] Integration test verifies correct cache header per auth state

---

#### TICKET-003 — Fix SSL rejectUnauthorized in Production ✅

**Priority:** P0  
**Effort:** XS (30 minutes)  
**File:** `Backend/src/db.ts`

**Problem:**  
`ssl: { rejectUnauthorized: false }` disables TLS certificate validation on the production DB connection, leaving it vulnerable to MITM attacks.

**Acceptance Criteria:**
- [x] Production DB connection uses `rejectUnauthorized: true`
- [x] Connection verified working with Neon's `-pooler.neon.tech` endpoint
- [x] Local development remains unaffected (`ssl: false`)

---

#### TICKET-004 — Remove Deprecated API Key Auth ✅

**Priority:** P0  
**Effort:** S  
**File:** `Backend/src/auth.ts`

**Problem:**  
`ADMIN_API_KEY` header auth is labeled "deprecated" in comments but remains fully active. Deprecated security code is attack surface.

**Acceptance Criteria:**
- [x] `x-api-key` header auth removed from `isAuthenticated` middleware
- [x] `ADMIN_API_KEY` removed from `env.ts` schema
- [x] All references to `isAdmin` (the old alias) removed
- [x] Existing API key rotated / invalidated
- [x] No regression in cookie-based JWT auth

---

#### TICKET-005 — Fix `transformMessage` this Binding ✅

**Priority:** P1  
**Effort:** XS (20 minutes)  
**File:** `Backend/src/repositories/message.repository.ts`

**Problem:**  
`results.map(this.transformMessage)` detaches `this` context. Works by luck today but is a latent crash.

**Acceptance Criteria:**
- [x] Changed to `results.map(m => this.transformMessage(m))`
- [x] Same fix applied to any other repository using the same pattern (project, portfolio-service, mindset repos)
- [x] Unit test covers `findAll()` returning correctly shaped objects

---

#### TICKET-006 — DELETE /messages/:id Returns 404 for Missing Records ✅

**Priority:** P1  
**Effort:** XS  
**File:** `Backend/src/routes/messages.ts`

**Problem:**  
DELETE returns `204` regardless of whether the record exists.

**Acceptance Criteria:**
- [x] Deleting a non-existent ID returns `404 { message: "Message not found" }`
- [x] Deleting an existing ID returns `204`
- [x] Integration test covers both cases

---

#### TICKET-007 — Fix Chatbot useEffect Focus Stealing ✅

**Priority:** P1  
**Effort:** S  
**File:** `Frontend/src/components/Chatbot.tsx`

**Problem:**  
A single `useEffect` with `[messages, isOpen]` dependencies re-focuses the input on every new message, interrupting users who clicked elsewhere (e.g., to copy text from an AI response).

**Acceptance Criteria:**
- [x] Split into two effects: one for `[isOpen]` (focus management) and one for `[messages]` (scroll only)
- [x] Clicking on a message to copy text does not lose focus
- [x] Opening the chatbot still correctly focuses the input
- [x] Closing the chatbot still correctly returns focus to the trigger button
- [x] Component test verifies focus behavior

---

### Epic 2 — Testing Infrastructure ✅ COMPLETE

> **Priority:** P0 — No new features until this is done  
> **Timeline:** Week 3–5  
> **Owner:** Full Stack  
> **Status:** All 5 tickets shipped. 116 automated tests (65 backend unit + 18 backend integration + 33 frontend unit) + 19 E2E test cases. CI pipeline with 6 jobs.

---

#### TICKET-008 — Backend Unit Test Suite ✅

**Priority:** P0  
**Effort:** L  
**Coverage Target:** ≥ 60% on tested files (unit tests only; integration tests complement)

**Acceptance Criteria:**
- [x] Test runner: `vitest` configured in `Backend/package.json`
- [x] Mocked DB layer via `vi.mock()` + `vi.hoisted()` for isolated tests (no production DB dependency)
- [ ] The following test files exist and pass:

| Test File | What It Must Cover |
|-----------|-------------------|
| `article.repository.test.ts` | `findAll(status)` filter, `findBySlug`, `create`, `update` with tag sync, `incrementViewCount` |
| `message.repository.test.ts` | `create`, `findAll`, `delete`, `bulkDelete` with empty array guard |
| `project.repository.test.ts` | `reorder`, `bulkUpdateStatus`, `bulkDelete` |
| `article.service.test.ts` | Redis cache hit, cache miss, invalidation on create/update/delete |
| `message.service.test.ts` | Honeypot rejection, DOMPurify sanitization, queue enqueue |
| `auth.test.ts` | bcrypt path, plaintext path, token blacklist check, constant-time comparison |
| `analytics.service.test.ts` | `getSummary` query logic |
| `validate.middleware.test.ts` | Valid body passes, invalid body returns 400 with structured errors |
| `cache.middleware.test.ts` | Sets headers for GET, skips for POST, skips when auth header present |

- [x] `npm test` command runs all unit tests (65 tests, 9 files)
- [x] `npm run test:coverage` generates coverage report
- [x] Coverage threshold enforced: lines ≥ 60%, functions ≥ 60% (scoped to tested files)

---

#### TICKET-009 — Backend Integration Test Suite ✅

**Priority:** P0  
**Effort:** L  
**Tool:** `supertest` + mocked services

**Acceptance Criteria:**
- [x] Isolated test app factory (`test-app.ts`) with no production DB dependency
- [x] `npm run test:integration` runs all integration tests (18 tests, 2 suites)
- [ ] The following route integration tests exist and pass:

| Route | Cases to Cover |
|-------|---------------|
| `POST /api/auth/login` | Correct password → 200 + cookie; Wrong password → 401; Rate limit (6th attempt) → 429 |
| `POST /api/auth/logout` | Valid token → 204 + cookie cleared + token blacklisted; No token → 401 |
| `GET /api/articles` | Unauthed → only published; Authed → all; Cache-Control headers correct per state |
| `GET /api/articles/:slug` | Published → 200; Draft + unauthed → 403; Draft + authed → 200 |
| `POST /api/messages` | Valid body → 201; Honeypot filled → 201 (fake success); Rate limit → 429; Missing fields → 400 |
| `POST /api/upload` | Invalid file type → 400; File > 5MB → 413; Valid image → 200 + Cloudinary URL |
| `DELETE /api/messages/:id` | Existing → 204; Non-existing → 404; Unauthed → 401 |
| `GET /api/projects` | Public → 200; Response is cached in Redis on 2nd call |

---

#### TICKET-010 — Frontend Unit Test Suite ✅

**Priority:** P0  
**Effort:** M  
**Tools:** `vitest` + `@testing-library/react`

**Acceptance Criteria:**
- [x] The following test files exist and pass (33 tests, 5 files):

| Test File | What It Must Cover |
|-----------|-------------------|
| `use-server-status.test.ts` | `checking → online`, `checking → waking` (slow), `waking → offline` (3 fails), query invalidation on recovery |
| `query-cache-persister.test.ts` | Write on success, skip on error, 7-day TTL rejection, version bust |
| `AnalyticsTracker.test.ts` | Bot UA filtered, duplicate path prevented, gtag called when available |
| `Chatbot.test.tsx` | Focus trap, Escape closes, no focus steal on reply, error state renders |
| `Contact.test.tsx` | Validation errors shown, honeypot hidden, success message on submit |
| `ServerStatusBanner.test.tsx` | Shows on waking/offline, hidden on online/checking |

---

#### TICKET-011 — E2E Critical Path Tests ✅

**Priority:** P0  
**Effort:** M  
**Tool:** Playwright (expanded from 3 smoke tests to 3 spec files, 19 test cases)

**Acceptance Criteria:**
- [x] The following E2E test cases exist and pass in CI:

| Test Name | Steps |
|-----------|-------|
| `contact-form-full-flow` | Fill form → submit → see success message |
| `admin-login-logout` | Login with password → dashboard visible → logout → redirected to login |
| `blog-article-read` | List page → click article → content visible → related articles shown |
| `project-detail` | Home → click project → detail page loads → API viewer shows data |
| `draft-article-protected` | GET `/blog/draft-slug` unauthenticated → 403 page shown |
| `rate-limiting` | 6 contact form POSTs → 6th returns 429 error message |
| `chatbot-open-close` | Click FAB → chatbot opens → Escape → chatbot closes → focus returns to FAB |

- [x] All E2E tests run in CI on every push to `main`
- [x] Tests run against Vite preview build (webServer config in playwright.config.ts)

---

#### TICKET-012 — CI Pipeline: Mandatory Testing ✅

**Priority:** P0  
**Effort:** S  
**File:** `.github/workflows/ci.yml`

**Acceptance Criteria:**
- [x] Unit tests run on every PR and push to `main` (backend-unit + frontend-unit jobs)
- [x] Integration tests run on every PR and push to `main` (backend-integration job)
- [x] E2E tests run on every push to `main` (frontend-e2e job with Playwright artifact upload)
- [x] Pipeline fails and blocks merge if any test fails
- [x] Playwright report uploaded as CI artifact (14-day retention)
- [ ] `npm audit --audit-level=high` — deferred to TICKET-023 (security scanning)
- [ ] Test services (PostgreSQL, Redis) — deferred to TICKET-020 (Docker)

---

### Epic 3 — Architecture Improvements

> **Priority:** P1  
> **Timeline:** Week 6–10  
> **Owner:** Backend

---

#### TICKET-013 — Cache AI Chat Context in Redis

**Priority:** P1  
**Effort:** M  
**File:** `Backend/src/routes/chat.ts`

**Problem:**  
4 DB queries on every chat message. At rate limit of 20 msgs/min = 80 DB queries/min just for static context.

**Acceptance Criteria:**
- [ ] System prompt built from DB data and cached in Redis with 15-minute TTL
- [ ] Cache key: `chat:system-prompt`
- [ ] On cache hit: zero DB queries for context building
- [ ] Cache invalidated when admin updates projects, skills, or experiences
- [ ] Unit test: verify DB is not queried on cache hit
- [ ] Unit test: verify cache is invalidated after project update

---

#### TICKET-014 — PlexusBackground Spatial Grid Optimization

**Priority:** P1  
**Effort:** M  
**File:** `Frontend/src/components/PlexusBackground.tsx`

**Problem:**  
O(n²) connection loop checks 44,850 pairs per frame at 60fps = ~2.7M distance calculations/second.

**Acceptance Criteria:**
- [ ] Uniform spatial grid partitions particles by `connectionDistance` cell size
- [ ] Connection search only checks particles in neighboring cells (27 cells in 3D)
- [ ] Connection geometry updated every 3rd frame (not every frame)
- [ ] No visual regression — connections still render correctly
- [ ] Performance: Chrome DevTools shows < 2ms for connection update on 300 particles
- [ ] Unit test: `SpatialGrid` class — insert, getNearby, clear

---

#### TICKET-015 — CSRF Protection for Admin Routes

**Priority:** P1  
**Effort:** M  
**Files:** `Backend/src/middleware/csrf.ts`, `Frontend/src/lib/api-helpers.ts`

**Acceptance Criteria:**
- [ ] New `csrf.ts` middleware implements Double Submit Cookie pattern
- [ ] Login sets a readable `csrf_token` cookie alongside HttpOnly `auth_token`
- [ ] All state-changing admin requests send `X-CSRF-Token` header (set automatically in `apiFetch`)
- [ ] Middleware validates header matches cookie using `crypto.timingSafeEqual`
- [ ] GET/HEAD/OPTIONS requests bypass CSRF check
- [ ] Requests without valid CSRF token return `403 { message: "Invalid CSRF token" }`
- [ ] Integration test: admin POST without CSRF token → 403; with token → 200

---

#### TICKET-016 — Implement Refresh Token Flow

**Priority:** P1  
**Effort:** L  
**Files:** `Backend/src/routes/auth.ts`, `Frontend/src/lib/api-helpers.ts`

**Acceptance Criteria:**
- [ ] Login issues two tokens: access (15min) + refresh (7 days) as HttpOnly cookies
- [ ] New `POST /api/auth/refresh` endpoint validates refresh token, issues new access token
- [ ] Refresh tokens stored (hashed) in Redis — can be revoked on logout/password change
- [ ] Frontend `apiFetch` intercepts 401, attempts silent refresh, retries original request
- [ ] If refresh fails, user is redirected to login
- [ ] Logout revokes both access and refresh tokens
- [ ] Integration tests cover: refresh success, refresh with revoked token → 401, expired refresh → 401

---

#### TICKET-017 — Domain-Separated Hook Files

**Priority:** P2  
**Effort:** M  
**File:** `Frontend/src/hooks/use-portfolio.ts` → `Frontend/src/hooks/portfolio/`

**Acceptance Criteria:**
- [ ] `use-portfolio.ts` split into domain files: `use-projects.ts`, `use-skills.ts`, `use-articles.ts`, `use-experiences.ts`, `use-services.ts`, `use-testimonials.ts`, `use-contact.ts`, `use-analytics.ts`, `use-auth.ts`
- [ ] `index.ts` re-exports all hooks for backwards compatibility
- [ ] No import changes required in consuming components (re-exports handle it)
- [ ] All existing tests pass unchanged

---

#### TICKET-018 — Fix API Versioning Architecture

**Priority:** P2  
**Effort:** S  
**Files:** `Backend/shared/routes.ts`, `Backend/src/index.ts`

**Acceptance Criteria:**
- [ ] All paths in `shared/routes.ts` include `/api/v1/` prefix
- [ ] URL rewrite middleware removed from `index.ts`
- [ ] Frontend and Backend both consume path from `routes.ts` (no hardcoded strings)
- [ ] All existing routes continue to respond at the same URLs
- [ ] No 307 redirects in production

---

#### TICKET-019 — Analytics getSummary() Full Aggregation

**Priority:** P2  
**Effort:** M  
**File:** `Backend/src/repositories/analytics.repository.ts`

**Current:** Returns only `{ totalViews, events }`.

**Acceptance Criteria:**
- [ ] `getSummary()` returns full analytics object:
  - `totalViews` — total page_view events
  - `totalEvents` — all event types
  - `dailyViews[]` — views per day for last 30 days (for Recharts time series)
  - `topProjects[]` — top 5 project IDs by view count
  - `deviceBreakdown[]` — mobile vs desktop percentages
  - `topCountries[]` — top 10 countries by visit count
- [ ] All aggregations done at DB level with `GROUP BY` (not in application code)
- [ ] Admin analytics tab updated to display time-series chart and breakdowns
- [ ] Query runs in < 500ms (add index on `created_at` if missing)

---

### Epic 4 — Infrastructure & Observability

> **Priority:** P1  
> **Timeline:** Week 11–14  
> **Owner:** DevOps + Backend

---

#### TICKET-020 — Docker Containerization

**Priority:** P1  
**Effort:** L

**Acceptance Criteria:**
- [ ] `Dockerfile.backend` — multi-stage build: `deps → build → prod` using `node:20-alpine`
- [ ] `Dockerfile.frontend` — multi-stage build: `node → vite build → nginx:alpine`
- [ ] `docker-compose.yml` — local dev stack with postgres + redis + backend + frontend
- [ ] `docker-compose.test.yml` — isolated test environment for CI
- [ ] `.dockerignore` excludes `node_modules`, `.env`, `dist`
- [ ] `docker-compose up` starts the full stack with one command
- [ ] Backend container passes health check at `/health`
- [ ] Frontend container serves the built SPA correctly
- [ ] Production image size: backend < 200MB, frontend < 50MB

---

#### TICKET-021 — Structured Logging with Pino

**Priority:** P1  
**Effort:** M  
**File:** `Backend/src/lib/logger.ts`

**Acceptance Criteria:**
- [ ] `logger.ts` singleton created with Pino
- [ ] Development: `pino-pretty` human-readable colorized output
- [ ] Production: JSON-formatted output (for Datadog/Logtail/Axiom)
- [ ] Log levels: `trace`, `debug`, `info`, `warn`, `error` — controlled by `LOG_LEVEL` env var
- [ ] `LOG_LEVEL` added to `env.ts` schema with default `'info'`
- [ ] All `console.log`, `console.warn`, `console.error` replaced with `logger.*`
- [ ] Request ID included on every log line
- [ ] Sensitive data redacted: `authorization` header, `x-api-key`, `password`, `token` fields
- [ ] Log entry structure: `{ level, time, requestId, method, path, statusCode, durationMs, msg }`

---

#### TICKET-022 — Sentry Error Tracking

**Priority:** P1  
**Effort:** M

**Acceptance Criteria:**
- [ ] `@sentry/node` installed and initialized in `Backend/src/index.ts`
- [ ] `@sentry/react` + `@sentry/vite-plugin` installed in Frontend
- [ ] `SENTRY_DSN` added to `env.ts` schema (optional — gracefully skipped if not set)
- [ ] Vite plugin uploads source maps on production build
- [ ] Unhandled exceptions in Backend captured with full stack trace
- [ ] Unhandled exceptions in Frontend captured with full stack trace
- [ ] Sentry error boundary wraps the React tree
- [ ] Performance tracing enabled: `tracesSampleRate: 0.1` in production
- [ ] Session replay enabled for error sessions only: `replaysOnErrorSampleRate: 1.0`
- [ ] Sentry does NOT capture in test environments

---

#### TICKET-023 — Dependency Security Scanning in CI

**Priority:** P1  
**Effort:** S

**Acceptance Criteria:**
- [ ] New `.github/workflows/security.yml` runs weekly and on every push to `main`
- [ ] `npm audit --audit-level=high` runs for both Backend and Frontend
- [ ] Pipeline fails if any high or critical severity vulnerability found
- [ ] `.github/dependabot.yml` created: weekly PRs for Backend and Frontend dependencies
- [ ] Dependabot limited to 5 open PRs at a time to avoid noise

---

#### TICKET-024 — Environment Validation Hardening

**Priority:** P1  
**Effort:** S  
**File:** `Backend/src/env.ts`

**Acceptance Criteria:**
- [ ] `JWT_SECRET` minimum length increased from 32 to 64 characters
- [ ] `JWT_REFRESH_SECRET` added (required, min 64 chars)
- [ ] `SENTRY_DSN` added (optional URL)
- [ ] `LOG_LEVEL` added with enum validation and default `'info'`
- [ ] `.env.example` updated with all new variables, descriptions, and example values
- [ ] Secret strength guidance added as comments in `.env.example`

---

### Epic 5 — Feature Enhancements

> **Priority:** P1–P2  
> **Timeline:** Week 15–20  
> **Owner:** Full Stack

---

#### TICKET-025 — Progressive Web App (PWA)

**Priority:** P1  
**Effort:** M  
**Tool:** `vite-plugin-pwa`

**Acceptance Criteria:**
- [ ] `vite-plugin-pwa` configured with `registerType: 'autoUpdate'`
- [ ] Service worker caches: JS/CSS/HTML/images/fonts on install
- [ ] Runtime cache strategy:
  - `GET /api/v1/projects`, `skills`, `articles`, `experiences` → `StaleWhileRevalidate`, 7-day TTL
  - `GET /api/v1/admin/*`, `/api/v1/auth/*` → `NetworkOnly` (never cached)
- [ ] Web App Manifest: name, short_name, theme_color `#00B4D8`, background_color `#050510`, `display: standalone`
- [ ] Icons: 192×192 and 512×512 maskable PNG
- [ ] Offline fallback page shown when network unavailable and page not cached
- [ ] Lighthouse PWA score: 100
- [ ] Install prompt shown on 2nd visit (not first)

---

#### TICKET-026 — Full Accessibility Audit (WCAG 2.1 AA)

**Priority:** P1  
**Effort:** L

**Acceptance Criteria:**
- [ ] `@axe-core/playwright` runs in CI — zero violations on: Home, Blog List, Blog Post, Project Detail, Contact
- [ ] Skip-to-main-content link as first focusable element on all pages
- [ ] All icon-only buttons have `aria-label`
- [ ] All color pairs pass 4.5:1 contrast ratio (use `@storybook/addon-a11y` for audit)
- [ ] Skill tree: keyboard navigable — arrow keys move between nodes, Enter selects
- [ ] Skill tree: on mobile (< 768px) a simplified accessible list view is shown instead of SVG
- [ ] Blog post: heading hierarchy validated (no h4 without h3)
- [ ] All form fields have associated `<label>` elements (not just placeholders)
- [ ] `touch-action: manipulation` on all interactive elements
- [ ] Lighthouse Accessibility score: 100

---

#### TICKET-027 — JSON-LD Structured Data (SEO)

**Priority:** P1  
**Effort:** M  
**File:** `Frontend/src/components/SEO.tsx`

**Acceptance Criteria:**
- [ ] `Person` schema on every page with `name`, `url`, `jobTitle`, `sameAs` (GitHub, LinkedIn)
- [ ] `SoftwareApplication` schema on Project Detail pages
- [ ] `TechArticle` schema on Blog Post pages with `headline`, `datePublished`, `dateModified`, `wordCount`
- [ ] `BreadcrumbList` schema on Blog Post and Project Detail pages
- [ ] All schemas validated with [Google's Rich Results Test](https://search.google.com/test/rich-results)
- [ ] No validation errors in structured data testing tool

---

#### TICKET-028 — Core Web Vitals Monitoring

**Priority:** P1  
**Effort:** M

**Acceptance Criteria:**
- [ ] `web-vitals` library installed and reporting: LCP, CLS, INP, FCP, TTFB
- [ ] Metrics sent to `POST /api/v1/analytics/vitals` with `name`, `value`, `rating`, `path`
- [ ] New `vitals` table in DB stores metrics (or reuse `analytics` table with `type: 'vital'`)
- [ ] Admin dashboard "Performance" tab shows:
  - Average LCP, CLS, INP over last 7 days
  - Pass/fail indicator per Core Web Vitals threshold (Good / Needs Improvement / Poor)
- [ ] Lighthouse CI added to `.github/workflows/ci.yml`:
  - Performance ≥ 90
  - Accessibility ≥ 100
  - Best Practices ≥ 95
  - SEO ≥ 95

---

#### TICKET-029 — Blog Full-Text Search

**Priority:** P2  
**Effort:** M  
**File:** `Backend/src/repositories/article.repository.ts`

**Acceptance Criteria:**
- [ ] PostgreSQL `tsvector` column added to `articles` table via Drizzle migration:
  ```sql
  ALTER TABLE articles ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector('english', title || ' ' || coalesce(excerpt, '') || ' ' || content)
    ) STORED;
  CREATE INDEX articles_search_idx ON articles USING GIN(search_vector);
  ```
- [ ] New `GET /api/articles/search?q=<term>` endpoint (max 10 results, published only)
- [ ] Results ranked by `ts_rank`
- [ ] Frontend: search input on Blog List page with debounced 300ms requests
- [ ] Empty query shows all articles (no search applied)
- [ ] No external search service required

---

#### TICKET-030 — Blog Reading Enhancements

**Priority:** P2  
**Effort:** M

**Acceptance Criteria:**
- [ ] Reading progress bar: fixed top of viewport, cyan color, updates on scroll (passive listener)
- [ ] Table of contents: auto-generated from `h2`/`h3` headings in article content, sticky on desktop
- [ ] Copy-to-clipboard button on all code blocks rendered by Tiptap/ReactMarkdown
- [ ] View count displayed on article cards (already tracked, just expose in UI)
- [ ] Reading time displayed prominently below article title (already calculated, improve placement)
- [ ] All enhancements pass accessibility check (ToC keyboard navigable, progress bar not announced by screen readers)

---

#### TICKET-031 — Admin Real-Time Message Notifications

**Priority:** P2  
**Effort:** M

**Acceptance Criteria:**
- [ ] New `GET /api/v1/messages/stream` SSE endpoint (requires auth)
- [ ] Emits `data: <JSON>` event when new message arrives via contact form
- [ ] Admin dashboard subscribes to SSE stream on mount, unsubscribes on unmount
- [ ] Unread message count badge in sidebar updates in real time
- [ ] Browser notification (if permission granted) shown for new messages
- [ ] SSE connection heartbeat every 30s to prevent proxy timeouts
- [ ] Fallback: if SSE fails, poll every 60s (existing behavior)

---

#### TICKET-032 — Admin Audit Log

**Priority:** P2  
**Effort:** M

**Acceptance Criteria:**
- [ ] New `audit_log` table: `id`, `action`, `entity`, `entity_id`, `old_values (jsonb)`, `new_values (jsonb)`, `created_at`
- [ ] Service decorator or middleware records every: CREATE, UPDATE, DELETE on: projects, articles, skills, experiences, services, testimonials
- [ ] New `GET /api/v1/admin/audit-log` endpoint (admin only, paginated)
- [ ] Admin dashboard "Audit Log" section shows last 50 actions with entity, action, timestamp
- [ ] Old/new values shown in expandable diff view
- [ ] Audit log cannot be deleted by admin (append-only)

---

### Epic 6 — Polish & Accessibility

> **Priority:** P2  
> **Timeline:** Week 21–24  
> **Owner:** Frontend

---

#### TICKET-033 — Dark/Light Mode CSS Variable System

**Priority:** P2  
**Effort:** M  
**File:** `Frontend/src/index.css`

**Problem:**  
All colors are hardcoded (`#0a0520`, `#050510`, etc.). Light mode is incomplete.

**Acceptance Criteria:**
- [ ] All hardcoded dark colors replaced with CSS custom properties
- [ ] `:root` defines light mode values; `.dark` class overrides to dark values
- [ ] `ThemeProvider` respects `prefers-color-scheme` on first visit
- [ ] Theme persisted in `localStorage` (already implemented — preserve behavior)
- [ ] Three.js `PlexusBackground` uses theme-aware colors
- [ ] Lighthouse Accessibility score unchanged (contrast ratios maintained in both modes)
- [ ] No visual regression in dark mode

---

#### TICKET-034 — Global Animation Token System

**Priority:** P2  
**Effort:** S  
**File:** `Frontend/src/lib/animation.ts`

**Acceptance Criteria:**
- [ ] `animation.ts` exports: `DURATION`, `EASE`, `VARIANTS` token objects
- [ ] All Framer Motion animations in the codebase use tokens (no raw numbers)
- [ ] Page transitions consistent across all routes
- [ ] No animation causes layout shift (CLS = 0)
- [ ] All animations respect `prefers-reduced-motion` (already partially done — make complete)

---

#### TICKET-035 — Mobile Experience Polish

**Priority:** P2  
**Effort:** M

**Acceptance Criteria:**
- [ ] Admin sidebar touch targets: minimum 44×44px on all interactive elements
- [ ] Skill tree: shows `SkillsListView` component on screens < 768px
- [ ] `SkillsListView`: categorized list, expandable categories, accessible (keyboard + screen reader)
- [ ] Chatbot: `bottom: calc(1.5rem + env(safe-area-inset-bottom))` for iOS home bar
- [ ] `touch-action: manipulation` applied globally via CSS to remove 300ms tap delay
- [ ] All tested on: iPhone 14 (iOS Safari), Pixel 7 (Chrome Android), iPad

---

#### TICKET-036 — Complete Documentation Suite

**Priority:** P2  
**Effort:** M

**Acceptance Criteria:**
- [ ] `ARCHITECTURE.md` created and covers:
  - Shared Zod schema pattern and why
  - Redis caching strategy (keys, TTLs, invalidation triggers)
  - Auth flow diagram (JWT lifecycle, blacklist, refresh tokens)
  - BullMQ email queue design
  - Vite chunk splitting decisions
  - Database pool config and Neon cold start handling
- [ ] `RUNBOOK.md` created and covers:
  - How to check server health
  - How to force-clear Redis cache
  - How to rollback a DB migration
  - How to restore from `backup-db.sh` snapshot
  - `FORCE_SEED=true` warning and safe usage
  - How to read Sentry errors and correlate with logs
- [ ] `CHANGELOG.md` created following [Keep a Changelog](https://keepachangelog.com) format
- [ ] JSDoc added to all public service methods (parameters, return type, throws)
- [ ] `.env.example` updated with descriptions for every variable

---

## 5. Non-Functional Requirements

### Performance

| Metric | Requirement |
|--------|-------------|
| Lighthouse Performance | ≥ 95 |
| First Contentful Paint | < 1.5s on 4G |
| Largest Contentful Paint | < 2.5s on 4G |
| Cumulative Layout Shift | < 0.1 |
| Time to Interactive | < 3.5s on 4G |
| API response time (p95) | < 500ms (excluding cold start) |
| DB query time (p95) | < 200ms |

### Reliability

| Metric | Requirement |
|--------|-------------|
| Test coverage (critical paths) | ≥ 90% |
| E2E test pass rate | 100% on `main` branch |
| Unhandled exception detection | < 1 minute (via Sentry) |
| Graceful shutdown | All in-flight requests complete before exit |

### Security

| Requirement | Implementation |
|-------------|---------------|
| All admin routes protected | JWT cookie + CSRF token |
| No sensitive data in logs | Pino redact config |
| No secrets in repository | `.env` in `.gitignore`, `.env.example` with placeholders |
| Dependencies audited | `npm audit` in CI, Dependabot weekly |
| TLS enforced | `rejectUnauthorized: true`, HSTS header |
| File uploads validated | Magic-byte check + MIME type + size limit |

### Accessibility

| Standard | Requirement |
|----------|-------------|
| WCAG | 2.1 Level AA |
| Lighthouse Accessibility | 100 |
| Automated violations | 0 (enforced in CI via axe-core) |
| Keyboard navigation | All interactive elements reachable |
| Screen reader | All content announced correctly |

---

## 6. Technical Constraints

| Constraint | Detail |
|------------|--------|
| Node.js version | 20 LTS |
| PostgreSQL version | 16 |
| Redis version | 7 |
| Frontend framework | React 19 — no downgrade |
| CSS framework | Tailwind CSS — no switch |
| ORM | Drizzle — no switch |
| Free tier hosting | Render (backend), Netlify/Cloudflare (frontend) — Docker must be compatible |
| No breaking API changes | All existing frontend queries must continue working |
| Backwards-compatible migrations | All Drizzle migrations must be reversible |

---

## 7. Release Plan

### Release 1.1 — Hotfix (End of Week 2)
> Fix all P0 bugs. No new features. Deploy immediately.

- TICKET-001 Drizzle filter bug
- TICKET-002 CDN draft exposure
- TICKET-003 SSL fix
- TICKET-004 Remove deprecated auth
- TICKET-005 transformMessage binding
- TICKET-006 DELETE 404
- TICKET-007 Chatbot focus

**Deploy gate:** All P0 tickets merged, manual smoke test passes.

---

### Release 1.2 — Quality (End of Week 5)
> Testing infrastructure complete. CI blocks on test failures from this point forward.

- TICKET-008 Backend unit tests
- TICKET-009 Backend integration tests
- TICKET-010 Frontend unit tests
- TICKET-011 E2E tests
- TICKET-012 CI pipeline

**Deploy gate:** CI green, coverage ≥ 90% on critical paths.

---

### Release 1.3 — Architecture (End of Week 10)
> Performance improvements and security hardening.

- TICKET-013 Chat context cache
- TICKET-014 Spatial grid
- TICKET-015 CSRF
- TICKET-016 Refresh tokens
- TICKET-017 Hook separation
- TICKET-018 API versioning
- TICKET-019 Analytics aggregation

**Deploy gate:** All integration tests pass, security review complete.

---

### Release 1.4 — Infrastructure (End of Week 14)
> Fully containerized, observable, and portable.

- TICKET-020 Docker
- TICKET-021 Pino logging
- TICKET-022 Sentry
- TICKET-023 Security scanning
- TICKET-024 Env hardening

**Deploy gate:** Docker image builds cleanly, Sentry receiving test events, `docker-compose up` verified by a second person.

---

### Release 2.0 — Features (End of Week 20)
> User-facing improvements and SEO/PWA.

- TICKET-025 PWA
- TICKET-026 Accessibility
- TICKET-027 JSON-LD
- TICKET-028 Core Web Vitals
- TICKET-029 Blog search
- TICKET-030 Blog enhancements
- TICKET-031 Real-time notifications
- TICKET-032 Audit log

**Deploy gate:** Lighthouse scores meet targets, zero axe-core violations in CI, Rich Results Test passes.

---

### Release 2.1 — Polish (End of Week 24)
> Final polish, documentation, and mobile refinement.

- TICKET-033 CSS variables / light mode
- TICKET-034 Animation tokens
- TICKET-035 Mobile polish
- TICKET-036 Documentation

**Deploy gate:** Full E2E suite passes on mobile viewport, ARCHITECTURE.md peer-reviewed.

---

## 8. Definition of Done

A ticket is **Done** when ALL of the following are true:

- [ ] Code written and self-reviewed
- [ ] Unit test(s) written and passing for new logic
- [ ] Integration test updated if route behavior changed
- [ ] E2E test added if user-facing flow is new or modified
- [ ] CI pipeline green (all tests pass, no lint errors, no audit failures)
- [ ] No new TypeScript `any` casts introduced (or justified in a comment)
- [ ] No new `console.log` in production code (use `logger.*`)
- [ ] No hardcoded secrets, URLs, or environment-specific values
- [ ] Acceptance criteria in ticket verified manually in a browser
- [ ] PR description explains **what** changed and **why**
- [ ] Migration (if DB change): reversible and tested with `drizzle-kit push` + rollback

---

## 9. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Drizzle ORM bug fix breaks other callers of `findAll()` | Medium | High | Unit tests cover all call sites before fix is merged |
| Refresh token implementation introduces auth regression | Medium | High | Integration tests cover full auth flow; feature flag for gradual rollout |
| Docker image too large for free-tier hosting | Low | Medium | Multi-stage build with Alpine base; image size checked in CI |
| Spatial grid optimization changes visual output | Low | Medium | Visual regression test with screenshot comparison before/after |
| axe-core CI gate blocks PRs due to pre-existing violations | High | Low | Run axe audit first, fix all existing violations before enabling gate |
| Sentry DSN accidentally committed | Low | High | `env.ts` validation, `SENTRY_DSN` in `.gitignore` example, pre-commit hook |
| PWA service worker caches stale admin data | Medium | High | All admin routes use `NetworkOnly` cache strategy; integration test verifies |
| Blog search `tsvector` migration on production with data | Low | Medium | Migration tested on staging clone first; `GENERATED ALWAYS AS` is non-destructive |

---

## 10. Out of Scope

The following are explicitly **not** in scope for v2.0:

- **Multiple admin users** — single admin remains; multi-user auth is a v3 consideration
- **Comments on blog posts** — no comment system; contact form is the feedback mechanism
- **Payment processing** — no e-commerce features
- **Mobile app** — PWA handles mobile use cases
- **Internationalization implementation** — i18n foundation is in scope (TICKET-026 references hooks setup), but actual translation of content is not
- **Email newsletter / subscription** — contact form is sufficient
- **Real-time collaborative editing** — single admin, no collaboration needed
- **Kubernetes / advanced orchestration** — Docker Compose is the target; K8s is out of scope

---

*This PRD defines the complete work to transform the portfolio from a strong v1 into a production-grade, fully tested, observable platform. Each ticket is independently shippable. Start with Epic 1, move to Epic 2, and do not skip the testing phase.*





i will answer here:
These are exactly the kind of clarifications a senior dev should raise before writing a single line. Good catches. Here are the official decisions:

**1. TICKET-003 — Neon TLS**
Neon's root CA is in Node's default trust store. No cert bundling needed. Just set `rejectUnauthorized: true` and use the `-pooler.neon.tech` connection string. No extra config.

**2. TICKET-009 — CI Test Database**
Use GitHub Actions `services` block with `postgres:16-alpine`. Credentials: `POSTGRES_DB: portfolio_test`, `POSTGRES_USER: postgres`, `POSTGRES_PASSWORD: testpassword`. Connection string: `postgresql://postgres:testpassword@localhost:5432/portfolio_test`. You provision it in the workflow YAML — no external DB needed.

**3. TICKET-013 — Cache Invalidation Strategy**
Explicit invalidation calls. Every service method that mutates projects, skills, or experiences calls `redis.del('chat:system-prompt')` directly after the DB write. No event bus. Keep it simple and traceable.

**4. TICKET-016 — Refresh Token Redis Key Format**
Since this app has only one admin (no user IDs), use `refresh:<tokenHash>` — no userId segment needed. Hash with `crypto.createHash('sha256').update(token).digest('hex')`. TTL matches token expiry (7 days = 604800 seconds).

Go ahead and build.