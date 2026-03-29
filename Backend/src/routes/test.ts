import { Router } from "express";
import { db } from "../db.js";
import { sql } from "drizzle-orm";
import { CacheService } from "../lib/cache.js";
import { asyncHandler } from "../lib/async-handler.js";
import { logger } from "../lib/logger.js";
import { seedDatabase } from "../seed.js";
import { redis } from "../lib/redis.js";

export const testRouter = Router();


testRouter.post(
    "/reset",
    asyncHandler(async (req, res) => {
        if (process.env.NODE_ENV !== "test") {
            return res.status(403).json({ error: "Only available in test environment" });
        }

        logger.info({ context: "test-reset" }, "Resetting database and cache for E2E...");

        // 1. Clear Redis state (Cache + Hardening Keys)
        try {
            await CacheService.clearAll();
            
            if (redis) {
                // Clear all lockout and attempt counters
                // We use a broader pattern to ensure we catch all variations (active, count, etc.)
                const lockoutKeys = await redis.keys("lockout:*");
                const attemptKeys = await redis.keys("login_attempts:*");
                const loginAttemptKeys = await redis.keys("login_attempt:*");
                const allToClear = [...lockoutKeys, ...attemptKeys, ...loginAttemptKeys];
                
                if (allToClear.length > 0) {
                    await redis.del(...allToClear);
                }
                
                // Reset JWT global version to 1
                await redis.set("glob:admin_token_version", "1");
                logger.info({ context: "test-reset" }, `Cleared ${allToClear.length} hardening keys and reset JWT version.`);
            }
        } catch (err) {
            logger.error({ context: "test-reset", error: err }, "Failed to clear Redis state");
        }

        // 2. Truncate all tables (Mirror of integration-setup.ts)
        const tables = [
            "analytics", "article_tags", "articles", "audit_log", "case_studies", 
            "chat_conversations", "client_feedback", "client_projects", "clients", 
            "code_reviews", "email_templates", "experiences", "guestbook", 
            "messages", "mindset", "projects", "reading_list", "scope_requests", 
            "seo_settings", "services", "site_settings", "sketchpad_sessions", 
            "skill_connections", "skills", "subscribers", "testimonials"
        ];

        for (const table of tables) {
            try {
                await db.execute(sql.raw(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`));
            } catch (err) {
                logger.error({ context: "test-reset", table, error: err }, `Failed to truncate table`);
            }
        }

        // 3. Re-seed essential data (Site Settings, etc.)
        try {
            await seedDatabase();
            logger.info({ context: "test-reset" }, "Database re-seeded successfully");
        } catch (err) {
            logger.error({ context: "test-reset", error: err }, "Failed to re-seed database");
        }

        res.status(200).json({ success: true, message: "Database and cache reset and seeded" });
    })
);

