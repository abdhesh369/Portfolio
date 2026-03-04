# Architecture Overview

> Portfolio Platform v2.0 — System Architecture Reference

## High-Level Diagram

```
┌─────────────────────────────────────────────────┐
│              Frontend (React 19 + Vite 7)        │
│  Netlify / Cloudflare Pages                      │
│  ┌─────────┐ ┌───────────┐ ┌──────────────────┐ │
│  │ wouter  │ │ TanStack  │ │ framer-motion    │ │
│  │ Router  │ │ Query     │ │ + animation.ts   │ │
│  └────┬────┘ └─────┬─────┘ └──────────────────┘ │
│       │            │                             │
│  ┌────▼────────────▼──────────────────────────┐  │
│  │  Shared Zod Schema (type inference + forms)│  │
│  └────────────────────────────────────────────┘  │
└───────────────────┬─────────────────────────────┘
                    │ HTTPS (JSON)
┌───────────────────▼─────────────────────────────┐
│              Backend (Express 4 + Node 20)       │
│  Render (Docker)                                 │
│  ┌────────┐ ┌──────────┐ ┌────────────────────┐ │
│  │ Routes │→│ Services │→│ Repositories       │ │
│  └────┬───┘ └────┬─────┘ └────────┬───────────┘ │
│       │          │                │              │
│  ┌────▼──┐ ┌─────▼────┐ ┌────────▼───────────┐  │
│  │ Auth  │ │ BullMQ   │ │ Drizzle ORM        │  │
│  │ (JWT) │ │ Queue    │ │ + node-postgres     │  │
│  └───┬───┘ └────┬─────┘ └────────┬───────────┘  │
│      │          │                │              │
│  ┌───▼──────────▼────────────────▼───────────┐  │
│  │              Redis 7                       │  │
│  │  (cache, sessions, blacklist, queues)      │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │         PostgreSQL 16 (Neon)               │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## Shared Zod Schema Pattern

The same `shared/schema.ts` file is duplicated in both `Backend/shared/` and `Frontend/shared/`. This file:

- Defines **all database tables** using `drizzle-orm/pg-core` (`pgTable`)
- Auto-generates **Zod validation schemas** via `drizzle-zod` (`createInsertSchema`, `createSelectSchema`)
- Applies additional refinements (string length, email format, etc.) using raw `zod`

**Why duplication instead of a shared package?**

1. **Zero build complexity** — No monorepo tooling (Turborepo, Nx) or `npm link` required
2. **Identical types** — Both sides get the same TypeScript types and runtime Zod validators
3. **Frontend uses it for**: form validation, type inference, API response typing
4. **Backend uses it for**: Drizzle ORM queries, request body validation, API response shaping

**Convention**: Any table/schema change must be applied to **both** copies. The Backend copy is the source of truth.

---

## Redis Caching Strategy

### Key Naming & TTLs

| Key Pattern | TTL | Service | Purpose |
|---|---|---|---|
| `projects:list` | 3600s (1 hr) | ProjectService | Full project listing |
| `skills:list` | 3600s (1 hr) | SkillService | All skills |
| `skill_connections` | 3600s (1 hr) | SkillConnectionService | Skill graph edges |
| `articles` | 3600s (1 hr) | ArticleService | All articles |
| `articles:status:{status}` | 3600s (1 hr) | ArticleService | Filtered by status |
| `article:{slug}` | 3600s (1 hr) | ArticleService | Single article |
| `articles:tracked-keys` | ∞ (SET) | ArticleService | Tracks all article cache variant keys |
| `testimonials` | 3600s (1 hr) | TestimonialService | All testimonials |
| `mindset` | 3600s (1 hr) | MindsetService | Mindset entries |
| `portfolio_services` | 3600s (1 hr) | PortfolioServiceService | Services listing |
| `email_templates` | 3600s (1 hr) | EmailTemplateService | Email templates |
| `seo_settings` | 3600s (1 hr) | SeoSettingsService | SEO config |
| `blacklist:{token}` | Auto (JWT remaining TTL) | Auth | Revoked access tokens |
| `refresh:{tokenHash}` | 604800s (7 days) | Auth | Active refresh tokens |

### Invalidation Strategy

- **Write-through invalidation**: Every `create()`, `update()`, `delete()` call explicitly `redis.del()` the relevant cache keys
- **Tracked-key pattern** (ArticleService): Uses a Redis SET (`articles:tracked-keys`) to track all variant cache keys. On mutation, `SMEMBERS` retrieves all keys, then bulk `DEL` clears them
- **Chat context cascade**: Most service mutations also invalidate the `CHAT_CACHE_KEY` so the AI chatbot context stays fresh
- **Auto-expiry for auth**: Blacklisted tokens auto-expire matching the JWT's remaining TTL

### HTTP Cache Middleware

`cachePublic(maxAgeSeconds)` sets `Cache-Control: public, max-age={N}, stale-while-revalidate=60` on GET responses. **Skips caching** if the request has an `auth_token` cookie, `Authorization` header, or `x-api-key` header to prevent leaking authenticated/draft content.

---

## Auth Flow (JWT Lifecycle)

### Token Types

| Token | Format | Storage | TTL | HttpOnly |
|---|---|---|---|---|
| Access | JWT (HS256) | `auth_token` cookie | 15 min | Yes |
| Refresh | Random hex (32 bytes) | `refresh_token` cookie + Redis (SHA-256 hash) | 7 days | Yes |
| CSRF | Random hex | `csrf_token` cookie | 7 days | **No** (readable by JS) |

### Login Flow (`POST /api/auth/login`)

```
Client                          Server                          Redis
  │                                │                               │
  │─── POST /login {password} ───→│                               │
  │                                │─── rate limit check (5/15m) ──│
  │                                │─── bcrypt.compare OR          │
  │                                │    timingSafeEqual ──────────→│
  │                                │                               │
  │                                │─── jwt.sign({role:"admin"},   │
  │                                │    15m expiry) ──────────────→│
  │                                │─── crypto.randomBytes(32) ───→│
  │                                │─── SET refresh:{hash} 7d ───→│
  │                                │                               │
  │←── Set-Cookie: auth_token ─────│                               │
  │←── Set-Cookie: refresh_token ──│                               │
  │←── Set-Cookie: csrf_token ─────│                               │
```

### Refresh Flow (`POST /api/auth/refresh`)

1. Read `refresh_token` cookie
2. SHA-256 hash it, validate against Redis key `refresh:{hash}`
3. Issue new 15-min access token cookie (refresh token is NOT rotated)

### Logout Flow (`POST /api/auth/logout`)

1. Blacklist current access token: `SET blacklist:{token}` with remaining TTL
2. Delete refresh token from Redis: `DEL refresh:{hash}`
3. Clear all 3 cookies

### Request Authentication

`isAuthenticated` middleware:
1. Extract token from `Bearer` header or `auth_token` cookie
2. Check `blacklist:{token}` in Redis — reject if found
3. `jwt.verify()` — reject if expired/invalid
4. Attach decoded payload to `req.user`

---

## BullMQ Email Queue

### Configuration

| Setting | Value |
|---|---|
| Queue Name | `"email"` |
| Redis Connection | Dedicated ioredis instances (separate from app singleton) |
| Activation | Always in dev; requires `REDIS_URL` in production |
| Retry | BullMQ default (0 retries) |
| Worker | Inline (same process) |

### Job Types

| Job Name | Payload | Purpose |
|---|---|---|
| `contact-notification` | `{ message: { name, email, subject, message }, targetEmail }` | Portfolio contact form → admin email |
| `admin-reply` | `{ to, subject, html }` | Admin replies to messages |

### Processing

- Worker uses **Resend SDK** (`RESEND_API_KEY`) to send emails
- From address: `env.CONTACT_EMAIL`
- Contact notifications are **HTML-escaped** before sending
- Events: `completed` and `failed` logged via Pino structured logger

---

## Vite Chunk Splitting Strategy

### Manual Chunks

| Chunk Name | Libraries | Rationale |
|---|---|---|
| `vendor-core` | react, react-dom, wouter, @tanstack/react-query, react-hook-form, @hookform | Core framework — changes rarely |
| `vendor-ui` | @radix-ui, lucide-react, clsx, class-variance-authority, tailwind-merge | UI primitives |
| `vendor-animation` | framer-motion, motion-dom, motion-utils | Animation (heavy, rarely updated) |
| `vendor-forms` | zod | Form validation |
| `vendor-editor` | @tiptap, prosemirror, lowlight, highlight.js | Rich text editor (admin-only) |
| `vendor-three` | three.js | 3D background (lazy-loaded) |
| `vendor-misc` | recharts, d3-*, react-redux, @dnd-kit, immer, reselect | Misc admin tools |

### Key Decisions

- **No catch-all chunk** — avoids TDZ (Temporal Dead Zone) errors with Zod v3/v4 dual bundling
- **`minify: 'esbuild'`** instead of Terser — Terser breaks Zod TDZ semantics
- **modulePreload filtering**: Admin-only chunks (`vendor-editor`, `vendor-admin`, `vendor-three`, `AdminDashboard`, `RichTextEditor`) are excluded from preloading for public visitors
- **PWA runtime caching**: Public API routes use StaleWhileRevalidate (7-day, 50 max entries); admin/auth routes are NetworkOnly

---

## Database Pool Configuration

| Setting | Production | Development |
|---|---|---|
| `max` connections | 20 | 5 |
| `idleTimeoutMillis` | 30,000ms | 30,000ms |
| `connectionTimeoutMillis` | 15,000ms | 15,000ms |
| `query_timeout` | 15,000ms | 15,000ms |
| SSL | `rejectUnauthorized: true` | `false` |

### Neon Cold Start Handling

Neon's free-tier databases hibernate after ~5 minutes of inactivity. The **15-second connection timeout** accommodates Neon's 3–7 second cold start wake-up time. The health check endpoint (`/health`) returns `"degraded"` (not error) during cold starts so Render doesn't fail the deployment.

### Health Check

`checkDatabaseHealth()` acquires a pool client, runs `SELECT 1` with a 5-second `Promise.race` timeout. Returns boolean — no exceptions thrown to callers.
