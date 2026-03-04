# Runbook — Portfolio Platform v2.0

> Operational procedures for monitoring, troubleshooting, and recovery.

---

## Table of Contents

1. [Health Checks](#health-checks)
2. [Force-Clear Redis Cache](#force-clear-redis-cache)
3. [Rollback a Database Migration](#rollback-a-database-migration)
4. [Restore from Database Backup](#restore-from-database-backup)
5. [Database Seeding](#database-seeding)
6. [Sentry Error Investigation](#sentry-error-investigation)
7. [Common Issues](#common-issues)

---

## Health Checks

### Liveness Probe

```bash
curl https://backend-1gk6.onrender.com/ping
# Expected: { "status": "ok" }
```

- **Purpose**: Confirms the process is running. Does NOT touch the database.
- **Used by**: Render deploy health check.

### Readiness / Deep Health

```bash
curl https://backend-1gk6.onrender.com/health
# Expected:
# {
#   "status": "healthy",         ← or "degraded"
#   "database": "connected",     ← or "reconnecting"
#   "redis": "connected",        ← or "reconnecting"
#   "environment": "production",
#   "timestamp": "2024-..."
# }
```

- Always returns **HTTP 200** (even when degraded) to prevent Render from marking the deploy as failed during Neon cold starts.
- `"degraded"` typically means the Neon database is waking up from hibernation (3–7 seconds). Retry in 10 seconds.

### API Health (monitoring tools)

```bash
curl https://backend-1gk6.onrender.com/api/v1/health
```

Same logic as `/health` but scoped under the API prefix. Use this for external uptime monitors.

---

## Force-Clear Redis Cache

### Clear all application caches

```bash
# Connect to Redis
redis-cli -u $REDIS_URL

# Option 1: Selective — delete known cache keys
DEL projects:list skills:list articles testimonials mindset portfolio_services email_templates seo_settings skill_connections

# Option 2: Clear all article variant keys
SMEMBERS articles:tracked-keys
# Then DEL each returned key

# Option 3: Nuclear — flush entire database (CAUTION: also clears auth tokens!)
FLUSHDB
```

### What gets invalidated automatically

Every service `create()`, `update()`, and `delete()` call automatically invalidates its cache key(s). Manual clearing is only needed if:
- Cache data is stale after a direct database edit
- You suspect a cache corruption issue
- You changed the schema and old cached data is incompatible

### ⚠️ Warning

`FLUSHDB` also clears:
- All refresh tokens → forces all admin sessions to re-login
- The JWT blacklist → previously revoked tokens become valid again until they naturally expire (max 15 minutes)

---

## Rollback a Database Migration

### Using Drizzle Kit

```bash
cd Backend

# Check current migration state
npx drizzle-kit check

# View migration history
ls drizzle/migrations/

# To rollback, you must:
# 1. Write a reverse migration SQL manually
# 2. Apply it via drizzle-kit push or direct SQL

# Alternatively, drop and re-push (DEV ONLY):
npx drizzle-kit push --force
```

### Manual SQL Rollback

```bash
# Connect to the database
psql $DATABASE_URL

# Check applied migrations
SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at DESC;

# Apply reverse SQL
\i drizzle/migrations/rollback-XXXX.sql

# Remove the migration record
DELETE FROM drizzle.__drizzle_migrations WHERE id = '<migration_id>';
```

### Best Practices

- All migrations should be **backwards-compatible** (additive changes only)
- Test migrations against a copy of production data before applying
- Keep legacy migration backups in `drizzle/migrations_mysql_legacy_backup/`

---

## Restore from Database Backup

### Creating a Backup

```bash
cd Backend
chmod +x scripts/backup-db.sh
./scripts/backup-db.sh
# Creates a timestamped .sql dump in the backup directory
```

### Restoring from Backup

```bash
cd Backend
chmod +x scripts/restore-db.sh
./scripts/restore-db.sh <backup-file.sql>
```

### Manual Restore

```bash
# 1. Drop and recreate the database (or use a fresh Neon branch)
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 2. Restore the dump
psql $DATABASE_URL < backup-2024-01-15.sql

# 3. Re-run migrations to ensure schema is current
cd Backend && npx drizzle-kit push

# 4. Clear Redis cache (old cached data is now stale)
redis-cli -u $REDIS_URL FLUSHDB

# 5. Verify
curl https://backend-1gk6.onrender.com/health
```

---

## Database Seeding

### How It Works

`seedDatabase()` runs on server startup and uses a **smart merge strategy**:

1. Checks if data already exists (e.g., `projectService.getAll()`)
2. If data exists → **updates/merges** existing records
3. If table is empty or doesn't exist → **inserts** seed data
4. The function is **idempotent** — safe to run multiple times

### ⚠️ FORCE_SEED Warning

If a `FORCE_SEED=true` environment variable is ever added:
- It would **wipe all existing data** and re-insert from seed
- **NEVER enable in production** without a backup
- Always take a backup first: `./scripts/backup-db.sh`

### Disabling Seeding

Comment out or conditionally skip the `seedDatabase()` call in `Backend/src/index.ts` if you don't want seed data to be merged on startup.

---

## Sentry Error Investigation

### Finding Errors

1. Open [Sentry Dashboard](https://sentry.io) → select the Portfolio project
2. Filter by environment: `production` or `development`
3. Look at the **Issues** tab for grouped error types

### Correlating with Logs

Every request gets a unique ID via the `X-Request-ID` header:

```
Request → X-Request-ID: abc123 → Pino logs: { reqId: "abc123", ... }
                                → Sentry breadcrumb: requestId = "abc123"
```

**Steps**:
1. Find the error in Sentry → note the `X-Request-ID` from breadcrumbs/tags
2. Search Render logs (or your log drain) for that request ID:
   ```bash
   # If using structured logging
   grep "abc123" /var/log/portfolio/*.log
   ```
3. The Pino log entry will show the full request context (method, path, user, timing)

### Sentry Configuration

| Setting | Backend | Frontend |
|---|---|---|
| DSN | `SENTRY_DSN` env var | `VITE_SENTRY_DSN` env var |
| Environment | `SENTRY_ENVIRONMENT` or `NODE_ENV` | `VITE_SENTRY_ENVIRONMENT` |
| Traces sample rate | 10% (prod), 100% (dev) | — |
| Profiling | Enabled (`nodeProfilingIntegration`) | — |

Set DSN to empty string or omit to disable Sentry entirely.

---

## Common Issues

### Neon Database Cold Start

**Symptom**: First request after 5+ minutes of inactivity returns slowly (3–7s) or times out.

**Resolution**: The 15-second connection timeout handles this automatically. The `/health` endpoint reports `"degraded"` during wake-up. No action needed — subsequent requests are fast.

### Redis Connection Lost

**Symptom**: Cache misses, auth failures, or queue job failures.

**Resolution**:
1. Check Redis health: `curl /health` → look at `redis` field
2. Verify `REDIS_URL` is correct
3. Redis client auto-reconnects with exponential backoff (`min(times * 50, 2000)ms`)
4. If persistent: restart the service, check Redis provider status

### BullMQ Emails Not Sending

**Symptom**: Contact form submissions succeed but no email arrives.

**Resolution**:
1. Check Redis connection (queue depends on it)
2. Verify `RESEND_API_KEY` and `CONTACT_EMAIL` env vars
3. Check Render logs for `email` queue `failed` events
4. BullMQ has 0 retries by default — failed jobs stay in the failed set

### JWT Token Issues

**Symptom**: Admin suddenly logged out or 401 errors.

**Resolution**:
1. Access tokens expire every 15 minutes — client should auto-refresh
2. Check if `FLUSHDB` was run (clears refresh tokens)
3. Verify `JWT_SECRET` hasn't changed (invalidates all existing tokens)
4. Check blacklist: `redis-cli EXISTS blacklist:{token}`
