# 🚀 Portfolio Operations Guide

This guide covers maintenance, monitoring, and scaling for your production environment.

---

## 🔔 Sentry Error Alerting (Risk #9)

To ensure you know about critical errors before your users do:

1. Log in to [Sentry.io](https://sentry.io).
2. Go to **Alerts** > **Create Alert**.
3. **Metric Alert**: Set "When the number of errors is more than **5** in **1 minute**".
4. **Action**: Set to email you or send a Slack/Discord notification.
5. **Environment**: Filter for `production`.

---

## 📦 Database Backups (Risk #8)

Your database is currently on Neon/Supabase. While they have internal backups, you should keep your own:

- **Manual Backup**: Run `npm run db:backup` from the `Backend` directory.
- **Automated Backup**: Set up a **GitHub Action** or a Cron job on a separate server to run this script daily.
- **Location**: Backups are saved to `Backend/backups/` and compressed to `.sql.gz`.

---

## ⚡ Performance & Global Latency (Risk #3 & #11)

To reduce latency for users outside of Singapore (where your Render instance is) and add DDoS protection:

### Cloudflare Setup
1. Add your site to **Cloudflare**.
2. Set your SSL mode to **Full (Strict)**.
3. In your `.env`, update `TRUST_PROXY` to the number of proxy tiers (usually `1` for Render, or `2` if Cloudflare is in front).
4. **Caching**: Enable "Auto Minify" and "Brotli" in Cloudflare Speed settings. This will cache your assets globally, reducing latency to <50ms for most users.

---

## 🛠️ Recovery Procedures

### What if Redis is down? (Risk #1)
The system is now **Fail-Open**. 
- Admin login still works (JWT signature is verified).
- Contact form replies will skip the queue and send **directly** via Resend.
- Rate limiting falls back to in-memory (per-instance).

### What if the Database is down? (Risk #7)
The **Circuit Breaker** will open. 
- All API routes will return a friendly `503 Service Unavailable`.
- The server will automatically probe for recovery every 15 seconds.

---

## 🔒 Security & Session Management

### 🔴 Emergency Revocation (Risk #15)
If you suspect your admin credentials have been compromised or a session token has been leaked, you can invalidate **every** active login immediately.

1.  **Route**: `POST /api/v1/auth/revoke-all`
2.  **Access**: Requires Admin Bearer token or active Admin Cookie.
3.  **Action**: This increments the global token version in Redis. Every existing token will immediately become invalid on its next verification.
