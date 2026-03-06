# Portfolio Project — PRD: Bug Fixes & Maintenance
**Version:** 3.0 — Post-Intern Forensic Review
**Date:** March 2026
**Project:** Full-Stack TypeScript Portfolio (Backend + Frontend Monorepo)
**Issues Found:** 19 total — 2 Critical, 6 High, 6 Medium, 5 Low
**Overall Score:** 5.5 / 10 *(regressed from 6/10 in v2)*

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Quality Score Dashboard](#2-quality-score-dashboard)
3. [What the Intern Did Well](#3-what-the-intern-did-well)
4. [Issues — Complete Catalogue](#4-issues--complete-catalogue)
5. [Fix Priority Matrix](#5-fix-priority-matrix)
6. [Test Coverage Gap Analysis](#6-test-coverage-gap-analysis)
7. [Long-Term Architecture Recommendations](#7-long-term-architecture-recommendations)
8. [Acceptance Criteria](#8-acceptance-criteria)
9. [Appendix A — File-Level Change Inventory](#appendix-a--file-level-change-inventory)

---

## 1. Executive Summary

The portfolio was reviewed after an intern was tasked with fixing outstanding issues from the v2 review and adding an admin customization feature. The result is mixed: the new `CustomizationTab` feature is well-built and correctly wired to the public site, but zero pre-existing issues were resolved, and the intern introduced new schema-related problems. The overall score has degraded.

The most dangerous pattern in this codebase is **systematic half-completion**: CI gates exist but code doesn't pass them (schema sync check: FAIL). Type declarations exist but aren't used (`express.d.ts` missing `user` property). The upload route was refactored correctly in one half (import fixed) but the other half (instance creation) was missed.

---

## 2. Quality Score Dashboard

| Area | v1 | Now (v3) | Trend |
|---|---|---|---|
| Architecture / Schema | 8/10 | 6/10 | ▼ |
| Code Quality | 7/10 | 6/10 | ▼ |
| Security | 7/10 | 6.5/10 | ▼ |
| Testing | 5/10 | 5/10 | — |
| CI / CD | 5/10 | 5.5/10 | ▲ |
| Documentation | 6/10 | 7/10 | ▲ |
| Admin / UX (new feature) | — | 8/10 | ▲ |
| **OVERALL** | **7.5/10** | **5.5/10** | **▼** |

---

## 3. What the Intern Did Well

Before cataloguing regressions, these additions are solid and should be kept as-is:

- **`CustomizationTab.tsx` (721 lines)** — Well-structured 8-section admin UI with drag-and-drop section ordering (DnD Kit), live color preview, font management, and feature toggles. DnD implementation is correct and idiomatic.
- **Migration `0008_extended_customization.sql`** — All 35 `ALTER TABLE` statements use `ADD COLUMN IF NOT EXISTS`, which is safe to re-run and won't break existing data.
- **`App.tsx` `SettingsApplicator`** — The hex-to-HSL conversion and CSS variable injection logic is correct and comprehensive.
- **`Home.tsx` dynamic sections** — Section order/visibility respects `sectionOrder` and `sectionVisibility` from settings correctly.
- **`Navbar.tsx` and `Footer.tsx`** — Both correctly fall back to static defaults when settings are unavailable, preventing a white-screen on first load.
- **`use-site-settings.ts`** — Clean, well-typed hook with 1-hour `staleTime` appropriate for settings data.

---

## 4. Issues — Complete Catalogue

---

### I-01 — Schema Drift: 79-Line Difference Between Backend and Frontend
**Severity:** 🔴 CRITICAL | **Area:** Architecture

The CI schema-sync check (`diff Backend/shared/schema.ts Frontend/shared/schema.ts`) produces 79 lines of diff, **failing the gate and blocking all CI merges**. The intern modified the Frontend schema to support types needed by `CustomizationTab` but did so inconsistently.

**Missing from `Frontend/shared/schema.ts`:**
- Type export: `InsertSkillConnection`
- Type export: `InsertAnalytics`
- Type export: `InsertEmailTemplate`
- 10 type guard functions: `isProject`, `isSkill`, `isExperience`, `isMessage`, `isMindset`, `isEmailTemplate`, `isSeoSettings`, `isTestimonial`, `isGuestbookEntry`, `isAuditLog`

The remaining type exports exist in both files but are in **different order**, further inflating the diff count.

**Root Cause:** There is no single source of truth. Both `Backend/shared/schema.ts` and `Frontend/shared/schema.ts` are maintained independently.

**Fix — Immediate (1 minute):**
```bash
cp Backend/shared/schema.ts Frontend/shared/schema.ts
```

**Fix — Long-term (2–3 hours):**

Create a shared monorepo package to eliminate duplication entirely:
```bash
mkdir -p packages/shared/src
mv Backend/shared/schema.ts packages/shared/src/schema.ts
mv Backend/shared/routes.ts packages/shared/src/routes.ts
```
Add `packages/shared` to workspaces in root `package.json`. Update both Backend and Frontend to import from `@portfolio/shared`.

Add a pre-commit hook:
```bash
diff Backend/shared/schema.ts Frontend/shared/schema.ts && echo 'Schema in sync' || (echo 'Schema drift detected' && exit 1)
```

---

### I-02 — `siteSettingsSchema` Has ~70 Duplicate Field Definitions
**Severity:** 🔴 CRITICAL | **Area:** Architecture

In `Backend/shared/schema.ts`, both `siteSettingsSchema` (line 633) and `insertSiteSettingsApiSchema` (line 704) independently define the same 70+ fields with identical validation rules. This is pure duplication introduced when the intern added customization fields to both schemas instead of deriving one from the other.

**Evidence (fields appearing twice):**
```typescript
// Line 639 in siteSettingsSchema:
personalName: z.string().max(255).optional()

// Line 708 in insertSiteSettingsApiSchema:
personalName: z.string().max(255).optional()  // EXACT DUPLICATE
```
`colorPrimary`, `navbarLinks`, `sectionOrder`, `featureBlog`, `heroTaglines`, `heroCtaPrimary`, `footerCopyright` — all duplicated identically.

**Fix:**
```typescript
export const siteSettingsSchema = z.object({ /* ...all fields... */ });

// Derive insert schema — don't copy-paste it
export const insertSiteSettingsApiSchema = siteSettingsSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .partial();
```

---

### I-03 — `auth.ts` Uses `(req as any).user` Despite `express.d.ts` Existing
**Severity:** 🟠 HIGH | **Area:** Code Quality

The `express.d.ts` type declaration file was added in v2 to solve exactly this problem, but it was only partially implemented. It adds `id` and `rawBody` to `Request` but omits `user`.

**Current (broken):**
```typescript
// Backend/src/types/express.d.ts
interface Request {
  id: string;
  rawBody?: Buffer;
  // user is MISSING
}

// Backend/src/auth.ts line 135
(req as any).user = decoded;  // type safety bypassed
```

**Fix:**
```typescript
// express.d.ts
import type { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      id: string;
      rawBody?: Buffer;
      user?: JwtPayload | string;  // ADD THIS
    }
  }
}

// auth.ts — now typesafe
req.user = decoded;
```

---

### I-04 — Multer Instance Created Per-Request (Performance & Memory Leak)
**Severity:** 🟠 HIGH | **Area:** Code Quality

In `Backend/src/routes/upload.ts`, the multer memory storage and upload middleware are instantiated **inside the async handler function body**. A new multer instance, a new `memoryStorage` instance, and a new `single()` middleware are allocated on every upload request. This is the exact issue flagged in v2 — the import was fixed but the instance creation was not.

**Current (broken):**
```typescript
asyncHandler(async (req, res) => {
  const storage = multer.memoryStorage();       // new object each request
  const uploadMem = multer({ storage, ... })    // new instance each request
    .single('file');                            // new middleware each request
  uploadMem(req, res, async (err) => { ... });
})
```

**Fix — Hoist to module level:**
```typescript
// TOP OF FILE — created once
const memStorage = multer.memoryStorage();
const uploadMem = multer({
  storage: memStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
}).single('file');

// Inside handler — just call it
asyncHandler(async (req, res) => {
  uploadMem(req, res, async (err: any) => { ... });
})
```

---

### I-05 — Two Dead Imports in `upload.ts` Remain Unfixed
**Severity:** 🟠 HIGH | **Area:** Code Quality

Both were flagged in v2. The intern fixed the wrong thing (moved a multer import) but left both dead imports untouched.

```typescript
// Backend/src/routes/upload.ts
import { Router, type Express } from 'express';  // 'Express' is NEVER used
import { upload } from '../lib/cloudinary.js';   // 'upload' is NEVER used
```

**Fix:**
```typescript
import { Router } from 'express';              // remove 'type Express'
// remove the entire 'upload' import line
```

---

### I-06 — `getQueryFn` Uses Raw `fetch()` — Bypasses CSRF, 401 Refresh, Error Normalization
**Severity:** 🟠 HIGH | **Area:** Architecture

In `Frontend/src/lib/queryClient.ts`, `getQueryFn` (the default query function for all GET requests) uses native `fetch()` directly. Meanwhile, all mutations go through `apiFetch`, which handles CSRF token injection, automatic 401 refresh, and consistent error throwing. This creates an asymmetric HTTP layer.

**Current (broken):**
```typescript
const res = await fetch(queryKey.join('/') as string, {
  credentials: 'include',
});  // No CSRF. No 401 refresh. No error normalization.
```

**Impact:**
- A 401 on a GET query does not trigger token refresh — user stays logged out until page reload
- Error messages from GET failures are formatted differently than mutation failures
- Future CSRF hardening on GET endpoints will silently break all queries

**Fix:**
```typescript
import { apiFetch, ApiError } from './api-helpers';

const getQueryFn: <T>(options) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      return await apiFetch(queryKey.join('/') as string);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        if (unauthorizedBehavior === 'returnNull') return null;
      }
      throw err;
    }
  };
```

---

### I-07 — `RUNBOOK.md` Contains Live Production URL
**Severity:** 🟠 HIGH | **Area:** Security

`RUNBOOK.md` contains `https://backend-1gk6.onrender.com` in **4 places**. This is a public repository. Exposing the production service URL invites targeted probing, DoS attempts, and rate-limit abuse.

```markdown
# RUNBOOK.md lines 24, 34, 51, 172
curl https://backend-1gk6.onrender.com/ping   # EXPOSED
curl https://backend-1gk6.onrender.com/health # EXPOSED
```

**Fix:**
```bash
export BACKEND_URL=https://your-backend.onrender.com
curl $BACKEND_URL/ping
curl $BACKEND_URL/health
```
Add a note at the top: *"Set `BACKEND_URL` environment variable before running commands in this document."*

---

### I-08 — 13 Remaining `as any` Casts
**Severity:** 🟡 MEDIUM | **Area:** Code Quality

| File | Cast | Fix |
|---|---|---|
| `src/auth.ts:135` | `(req as any).user = decoded` | Fix via I-03 |
| `src/services/settings.service.ts:39` | `{ ... } as any` | Use `Partial<InsertSiteSettings>` |
| `src/services/settings.service.ts:56` | `sanitizedData as any` | Already typed as `InsertSiteSettings` |
| `src/services/project.service.ts:89` | `status as any` | Use `ProjectStatus` union type |
| `src/services/article.service.ts:43` | `status as any` | Use `ArticleStatus` union type |
| `src/repositories/experience.repository.ts:49` | `data as any` | Use `Partial<DbInsertExperience>` |
| `src/repositories/portfolio-service.repository.ts:45` | `data as any` | Use `Partial<DbInsertService>` |
| `src/repositories/mindset.repository.ts:45` | `data as any` | Use `Partial<DbInsertMindset>` |
| `src/lib/cloudinary.ts:32` | `opts as any` | Use `CloudinaryConfig` type |
| `src/lib/queue.ts:40` | `connection as any` | Use `IORedis` type from bullmq |
| `src/lib/queue.ts:102` | `connection as any` | Use `IORedis` type from bullmq |
| `src/seed.ts:181` | `skill as any` | Use `InsertSkill` type |
| `src/seed.ts:184` | `skill as any` | Use `InsertSkill` type |

---

### I-09 — CI Node Version Mismatch: `ci.yml` uses Node 22, `security.yml` uses Node 20
**Severity:** 🟡 MEDIUM | **Area:** CI/CD

Package resolution, native addon compatibility, and audit results can differ between major Node versions.

```yaml
# ci.yml
node-version: 22

# security.yml
node-version: '20'  # different!
```

**Fix:** Standardize both files on Node 22. Extract to a workflow-level env var:
```yaml
env:
  NODE_VERSION: '22'

# In steps:
node-version: ${{ env.NODE_VERSION }}
```

---

### I-10 — CI Lint Step Has `continue-on-error: true` — Masks Real Failures
**Severity:** 🟡 MEDIUM | **Area:** CI/CD

Both Backend and Frontend lint steps in `ci.yml` have `continue-on-error: true`. TypeScript errors in the codebase will never fail CI. Note: unlike v2, `npm run lint` now *does* exist in both packages (`tsc --noEmit`) — the flag is purely suppressing real failures.

**Fix:** Remove `continue-on-error: true` from both lint steps. Run `npx tsc --noEmit` locally first to discover and fix any current failures, then remove the flag.

---

### I-11 — Internal Ticket References in Production Source Code
**Severity:** 🟡 MEDIUM | **Area:** Code Quality

`TICKET-032`, `TICKET-031`, `BUG-02`, `TICKET-028`, `TICKET-030` appear in source code comments. These reference an internal tracking system that doesn't exist in the public repo.

**Files affected:**
- `Backend/src/lib/audit.ts` — TICKET-032
- `Backend/src/lib/sse.ts` — TICKET-031
- `Backend/src/routes/upload.ts` — BUG-02
- `Backend/src/routes.ts` — TICKET-032
- `Frontend/src/lib/web-vitals.ts` — TICKET-028
- `Frontend/src/pages/admin/AdminDashboard.tsx` — TICKET-031
- `Frontend/src/hooks/use-message-stream.ts` — TICKET-031
- `Frontend/src/hooks/use-code-block-copy.ts` — TICKET-030
- `Frontend/src/components/admin/AnalyticsOverview.tsx` — TICKET-028
- `Frontend/src/components/TableOfContents.tsx` — TICKET-030

**Fix:** Replace all ticket references with descriptive comments:
```typescript
// BEFORE: TICKET-032: Convenience function to record audit events.
// AFTER:  Records an audit log entry for admin actions (create/update/delete).
```

---

### I-12 — E2E Tests Use Conditional Guards — Silent Skip Instead of Fail
**Severity:** 🟡 MEDIUM | **Area:** Testing

`admin-flow.spec.ts` wraps UI interactions in `if`-conditions that swallow errors. If a button doesn't exist, the test silently passes. False confidence.

```typescript
// ANTI-PATTERN
if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
  await submitBtn.click();  // silently skipped if button missing
}
```

**Fix:**
```typescript
// CORRECT — fails if button is missing
await expect(submitBtn).toBeVisible({ timeout: 5000 });
await submitBtn.click();
```

---

### I-13 — `docker-compose.yml` Has Hardcoded Secrets in Version Control
**Severity:** 🟡 MEDIUM | **Area:** Security

```yaml
POSTGRES_PASSWORD: password
ADMIN_PASSWORD: admin
JWT_SECRET: dev_secret_key_at_least_64_characters_long_for_proper_security_padding__
```

**Fix:** Switch to env var references:
```yaml
environment:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme_in_production}
  ADMIN_PASSWORD: ${ADMIN_PASSWORD:-changeme_in_production}
  JWT_SECRET: ${JWT_SECRET:-changeme_in_production}
```
Create `.env.docker` (gitignored) with actual local values.

---

### I-14 — 86% of Services Untested
**Severity:** ⚪ LOW | **Area:** Testing

| Layer | Tested | Total | Coverage |
|---|---|---|---|
| Backend Services | 2 | 14 | 14% ❌ |
| Backend Repositories | 4 | 13 | 31% ❌ |
| Frontend Components | 3 | 40+ | ~7% ❌ |
| Frontend Hooks | 1 | 15+ | ~7% ❌ |

**Priority services to test first:**
1. `settings.service.ts` — drives entire customization system
2. `project.service.ts` — core portfolio content
3. `auth.ts` middleware — security-critical
4. `guestbook.service.ts` — new feature, zero tests
5. `use-site-settings.ts` hook — drives all customization rendering

---

### I-15 — `query-cache-persister` Shows Stale Data With No Loading Indicator
**Severity:** ⚪ LOW | **Area:** UX

When content has been deleted or updated since the last visit, stale cached data is visible for 1–3 seconds before fresh data replaces it. No visual indication of refresh.

**Fix:**
```typescript
const { data, isFetching } = useSiteSettings();
{isFetching && <div className="text-xs opacity-50">Refreshing...</div>}
```

---

### I-16 — `CHANGELOG.md` Not Updated, Version Still `1.0.0`
**Severity:** ⚪ LOW | **Area:** Documentation

CHANGELOG has no entries for v2 fixes, the new customization feature, or migration 0008. Both `Backend/package.json` and `Frontend/package.json` are still version `1.0.0`.

**Fix:** Add changelog entry and bump to `2.0.0`:
```markdown
## [2.0.0] - 2026-03-07
### Added
- Admin Customization tab with full site branding control
- Dynamic section ordering and visibility toggle
- Feature toggles for blog, guestbook, testimonials, services
- Extended siteSettings schema (migration 0008)
### Fixed
- Nonce-based CSP (removed unsafe-inline)
- Request ID typing via express.d.ts
- Cloudinary cloud name env guard
```

---

### I-17 — `ServerStatusBanner` Has No Wait-Time Estimate
**Severity:** ⚪ LOW | **Area:** UX

When the backend cold-starts (Render free tier), users have no way to know whether to wait 5 seconds or 3 minutes.

**Fix:**
```typescript
const [elapsed, setElapsed] = useState(0);
useEffect(() => {
  if (status !== 'starting') return;
  const id = setInterval(() => setElapsed(e => e + 1), 1000);
  return () => clearInterval(id);
}, [status]);

// In render:
<p>Server is warming up... ({elapsed}s) — usually takes 30–60 seconds</p>
```

---

### I-18 — No Tests for `CustomizationTab` or `use-site-settings` Hook
**Severity:** ⚪ LOW | **Area:** Testing

The new customization feature (721 lines) has zero test coverage.

**Minimum tests to add:**
- `use-site-settings.ts`: test `useSiteSettings` returns data, test `useUpdateSiteSettings` calls `PATCH` with correct body, test `invalidateQueries` on success
- `CustomizationTab.tsx`: test form renders with correct defaults, test save calls mutation, test visibility toggle updates correct field, test DnD reordering produces correct `sectionOrder` array

---

### I-19 — `sectionOrder` Default Values Inconsistent Across 3 Places
**Severity:** ⚪ LOW | **Area:** Architecture

| Location | Default Sections |
|---|---|
| Migration 0008 | 6 sections (hero, about, projects, skills, testimonials, contact) |
| `schema.ts` `siteSettingsTable` default | 6 sections |
| `CustomizationTab.tsx` `DEFAULT_SETTINGS` | **11 sections** ✅ |

A fresh database installation will have an incomplete `sectionOrder` missing `whyhireme`, `services`, `mindset`, `practice`, `experience`, `guestbook`.

**Fix:** Update migration 0008 and `siteSettingsTable` default to use the full 11-section list that `DEFAULT_SETTINGS` already has.

---

## 5. Fix Priority Matrix

### Tier 1 — Do Today (< 30 minutes total)

| Issue | Action | Time | Unblocks |
|---|---|---|---|
| I-01 | `cp Backend/shared/schema.ts Frontend/shared/schema.ts` | 1 min | CI schema-sync gate |
| I-05 | Remove 2 dead imports from `upload.ts` | 2 min | tsc warnings |
| I-07 | Replace live URL in `RUNBOOK.md` with `$BACKEND_URL` | 3 min | Security |
| I-11 | Replace all TICKET-*/BUG-* comments | 10 min | Code hygiene |
| I-16 | Update `CHANGELOG.md`, bump version to `2.0.0` | 10 min | Docs |

### Tier 2 — This Week (2–4 hours total)

- **I-02** — Deduplicate `siteSettingsSchema` using `.omit().partial()` (~30 min)
- **I-03** — Add `user` to `express.d.ts`, remove `(req as any).user` (~15 min)
- **I-04** — Hoist multer instance creation to module level (~10 min)
- **I-06** — Replace `fetch` with `apiFetch` in `getQueryFn` (~20 min)
- **I-08** — Fix 5 highest-risk `as any` casts (auth, settings, project services) (~1 hour)
- **I-09** — Standardize Node version across CI workflows (~5 min)
- **I-10** — Remove `continue-on-error: true` from CI lint steps (~5 min)
- **I-13** — Switch `docker-compose.yml` to env var references (~15 min)
- **I-19** — Fix `sectionOrder` defaults to full 11-section list (~15 min)

### Tier 3 — Next Sprint (8–12 hours total)

- **I-08** (remaining) — Fix all 8 remaining `as any` casts
- **I-12** — Rewrite E2E conditional guards as proper `expect()` assertions
- **I-14** — Write tests for `settings.service`, `project.service`, `auth` middleware (target: 60% service coverage)
- **I-15** — Add stale data indicator to `query-cache-persister`
- **I-17** — Add elapsed timer to `ServerStatusBanner`
- **I-18** — Write tests for `CustomizationTab` and `use-site-settings`

### Tier 4 — Architecture Refactor (1–2 days)

- **I-01** (long-term) — Create `packages/shared/` monorepo package, eliminate schema duplication entirely
- Add husky pre-commit hook for schema sync check
- Set up ESLint with `@typescript-eslint/no-explicit-any: 'error'`
- Raise overall service test coverage to 60% minimum

---

## 6. Test Coverage Gap Analysis

### Backend — Service Coverage

| Service | Status |
|---|---|
| `article.service.ts` | ✅ Tested |
| `message.service.ts` | ✅ Tested |
| `settings.service.ts` | ❌ No tests — **HIGH priority** (drives customization) |
| `project.service.ts` | ❌ No tests — **HIGH priority** |
| `auth.ts` middleware | ❌ No tests — **HIGH priority** (security) |
| `guestbook.service.ts` | ❌ No tests |
| `analytics.service.ts` | ❌ No tests |
| `audit-log.service.ts` | ❌ No tests |
| `email-template.service.ts` | ❌ No tests |
| `experience.service.ts` | ❌ No tests |
| `mindset.service.ts` | ❌ No tests |
| `portfolio-service.service.ts` | ❌ No tests |
| `seo-settings.service.ts` | ❌ No tests |
| `skill.service.ts` | ❌ No tests |
| `skill-connection.service.ts` | ❌ No tests |
| `testimonial.service.ts` | ❌ No tests |

### Backend — Repository Coverage

- ✅ Tested: `analytics`, `article`, `message`, `project`
- ❌ Missing: `audit-log`, `email-template`, `experience`, `guestbook`, `mindset`, `portfolio-service`, `seo-settings`, `settings`, `skill`, `skill-connection`, `testimonial`

### Frontend — Existing Tests

- ✅ `ErrorBoundary.test.tsx`
- ✅ `SectionHeading.test.tsx`
- ✅ `SpatialGrid.test.ts`
- ✅ `use-document-title.test.ts`
- ✅ `lib/__tests__/utils.test.ts`
- ✅ `lib/api-helpers.test.ts`
- ❌ No tests for any admin tab (14 tabs)
- ❌ No tests for any public page component
- ❌ No tests for `use-site-settings`, `use-auth`, `use-portfolio`, `use-server-status`

---

## 7. Long-Term Architecture Recommendations

### 7.1 — Eliminate Schema Duplication Permanently

```
portfolio-monorepo/
├── packages/
│   └── shared/           ← NEW: single source of truth
│       ├── package.json  (name: @portfolio/shared)
│       └── src/
│           ├── schema.ts
│           └── routes.ts
├── Backend/
│   └── package.json  (add: '@portfolio/shared': 'workspace:*')
└── Frontend/
    └── package.json  (add: '@portfolio/shared': 'workspace:*')
```

With npm workspaces already configured at the root, adding `packages/shared` requires only a `package.json` in the new directory. Both Backend and Frontend then import from `@portfolio/shared` and the files can **never** drift.

### 7.2 — Enforce Type Safety with ESLint

```bash
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

```javascript
// eslint.config.js
rules: {
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-unsafe-assignment': 'error',
}
```

### 7.3 — Add E2E Tests to CI

```yaml
e2e:
  name: E2E Tests
  needs: [backend, frontend]
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - run: docker compose -f docker-compose.test.yml up -d
    - run: npx playwright install --with-deps
    - run: npm run test:e2e -w Frontend
    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: Frontend/playwright-report/
```

### 7.4 — Pre-Commit Hooks

Three hooks that would prevent 80% of the issues in this document:

```bash
# 1. Schema sync — catches I-01 before push
diff Backend/shared/schema.ts Frontend/shared/schema.ts

# 2. No any casts — catches I-08 regressions
grep -rn 'as any' src/

# 3. No ticket refs — catches I-11 regressions
grep -rn 'TICKET-\|BUG-[0-9]' src/
```

---

## 8. Acceptance Criteria

### Non-Negotiable (before next deployment)

- [ ] `diff Backend/shared/schema.ts Frontend/shared/schema.ts` produces zero output
- [ ] `grep -rn 'as any' Backend/src/auth.ts` returns zero results
- [ ] `grep -rn 'TICKET-\|BUG-0' Backend/src/ Frontend/src/` returns zero results
- [ ] `grep -rn 'backend-1gk6.onrender.com' RUNBOOK.md` returns zero results
- [ ] CI pipeline passes all gates with no `continue-on-error` overrides
- [ ] Both CI workflows use the same Node.js version

### Quality Targets (before v3.0.0 release)

- [ ] Backend service test coverage ≥ 60%
- [ ] No `as any` casts in `services/` or `repositories/`
- [ ] E2E tests have no conditional guards — all use `expect().toBeVisible()`
- [ ] `CustomizationTab` has at least 4 unit tests
- [ ] `use-site-settings` hook has at least 3 unit tests
- [ ] `CHANGELOG.md` is up to date

### Architecture (before next hire)

- [ ] `packages/shared/` monorepo package created
- [ ] ESLint with `@typescript-eslint/no-explicit-any: 'error'` running in CI
- [ ] Pre-commit hooks blocking schema drift and `any`-cast introduction
- [ ] E2E CI job configured and passing

---

## Appendix A — File-Level Change Inventory

| File | Issues | Change Required |
|---|---|---|
| `Frontend/shared/schema.ts` | I-01 | Copy from Backend — sync now |
| `Backend/shared/schema.ts` | I-02, I-19 | Deduplicate schema; fix sectionOrder default |
| `Backend/src/auth.ts` | I-03, I-08 | Remove `(req as any).user` |
| `Backend/src/types/express.d.ts` | I-03 | Add `user?: JwtPayload \| string` |
| `Backend/src/routes/upload.ts` | I-04, I-05, I-11 | Hoist multer; remove dead imports; remove BUG-02 |
| `Frontend/src/lib/queryClient.ts` | I-06 | Replace `fetch` with `apiFetch` in `getQueryFn` |
| `RUNBOOK.md` | I-07 | Replace live URL with `$BACKEND_URL` |
| `Backend/src/services/settings.service.ts` | I-08 | Remove `as any` casts |
| `Backend/src/services/project.service.ts` | I-08 | Remove `as any` cast |
| `Backend/src/services/article.service.ts` | I-08 | Remove `as any` cast |
| `Backend/src/repositories/experience.repository.ts` | I-08 | Remove `as any` cast |
| `Backend/src/repositories/mindset.repository.ts` | I-08 | Remove `as any` cast |
| `Backend/src/repositories/portfolio-service.repository.ts` | I-08 | Remove `as any` cast |
| `.github/workflows/ci.yml` | I-09, I-10 | Fix Node version; remove `continue-on-error` |
| `.github/workflows/security.yml` | I-09 | Fix Node version to 22 |
| `Backend/src/lib/audit.ts` | I-11 | Remove TICKET-032 reference |
| `Backend/src/lib/sse.ts` | I-11 | Remove TICKET-031 reference |
| `Backend/src/routes.ts` | I-11 | Remove TICKET-032 reference |
| `Frontend/src/lib/web-vitals.ts` | I-11 | Remove TICKET-028 reference |
| `Frontend/src/pages/admin/AdminDashboard.tsx` | I-11 | Remove TICKET-031 reference |
| `Frontend/src/hooks/use-message-stream.ts` | I-11 | Remove TICKET-031 reference |
| `Frontend/src/hooks/use-code-block-copy.ts` | I-11 | Remove TICKET-030 reference |
| `Frontend/src/components/admin/AnalyticsOverview.tsx` | I-11 | Remove TICKET-028 reference |
| `Frontend/src/components/TableOfContents.tsx` | I-11 | Remove TICKET-030 reference |
| `Frontend/e2e/admin-flow.spec.ts` | I-12 | Replace conditional guards with proper assertions |
| `docker-compose.yml` | I-13 | Switch to env var references for secrets |
| `CHANGELOG.md` | I-16 | Add v2.0.0 entry |
| `Backend/package.json` | I-16 | Bump version to `2.0.0` |
| `Frontend/package.json` | I-16 | Bump version to `2.0.0` |
| `Frontend/src/components/ServerStatusBanner.tsx` | I-17 | Add elapsed timer |

---

*Portfolio PRD v3.0 — 19 Issues — 28 Files to Change — Generated March 2026*
