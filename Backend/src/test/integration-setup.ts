import { beforeEach, afterAll, beforeAll } from "vitest";
import { db, pool } from "../db.js";
import { sql } from "drizzle-orm";
import { CacheService } from "../lib/cache.js";
import { initQueues } from "../lib/queue.js";

/**
 * Global setup for integration tests.
 * Runs once before all tests in a file.
 */
beforeAll(async () => {
    // 1. Ensure schema is up to date
    // Note: We've manually pushed the schema to the test database to avoid migration schema lock issues on Neon.
    // For now, we skip automated bootstrap to ensure tests run fast and don't timeout.
    // await bootstrapDatabaseSchema();
    
    // 2. Initialize queues (needed for some integration tests)
    initQueues();
});

/**
 * Clean the database before each test to ensure a predictable state.
 */
beforeEach(async () => {
    // Truncate all tables and restart identities. 
    // This is faster than dropping and re-creating the schema.
    const tables = [
        "analytics", "article_tags", "articles", "audit_log", "case_studies", 
        "chat_conversations", "client_feedback", "client_projects", "clients", 
        "code_reviews", "email_templates", "experiences", "guestbook", 
        "messages", "mindset", "projects", "reading_list", "scope_requests", 
        "seo_settings", "services", "site_settings", "sketchpad_sessions", 
        "skill_connections", "skills", "subscribers", "testimonials"
    ];

    // 1. Clear Redis cache (targeted namespaces)
    try {
        await CacheService.clearAll();
    } catch (err) {
        // Silently continue if Redis is not reachable, but log it in debug
        if (process.env.LOG_LEVEL === 'debug') {
            console.error("Cache clear skipped in test:", err);
        }
    }

    // 2. Truncate all tables
    for (const table of tables) {
        try {
            await db.execute(sql.raw(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`));
        } catch (err) {
            // Only log if it's not a "table does not exist" error (which shouldn't happen after bootstrap)
            console.error(`Failed to truncate ${table}:`, err);
        }
    }
});


/**
 * Close the database pool after all tests to prevent connection leaks.
 */
afterAll(async () => {
    await pool.end();
});

export {};
