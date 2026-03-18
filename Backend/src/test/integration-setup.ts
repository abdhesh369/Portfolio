// Set test environment variables before any module imports
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-long-enough-for-validation-at-least-64-characters-long-!!!!";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-long-enough-for-validation-at-least-64-characters-long-!!!!";
process.env.DATABASE_URL = "postgres://postgres:postgres@localhost:5432/portfolio_test";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.RESEND_API_KEY = "re_test_123";
process.env.PORT = "3001";
process.env.CLOUDINARY_CLOUD_NAME = "test";
process.env.CLOUDINARY_API_KEY = "test";
process.env.CLOUDINARY_API_SECRET = "test";
process.env.ADMIN_PASSWORD = "test-admin-password";
process.env.ADMIN_EMAIL = "admin@test.com";

import { beforeEach, afterAll } from "vitest";
import { db, pool } from "../db.js";
import { sql } from "drizzle-orm";
import { CacheService } from "../lib/cache.js";


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
        console.error("Failed to clear cache:", err);
    }

    // 2. Truncate all tables
    for (const table of tables) {
        try {
            await db.execute(sql.raw(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`));
        } catch (err) {
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
