import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { PoolClient } from "pg";
import { db, pool } from "../db.js";
import { logger } from "./logger.js";
import path from "path";
import fs from "fs";

const STARTUP_MIGRATIONS_FOLDER = path.resolve(process.cwd(), "drizzle/migrations");

function parseBoolean(value: unknown): boolean | null {
    if (typeof value === "boolean") return value;
    if (typeof value !== "string") return null;

    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "n", "off"].includes(normalized)) return false;
    return null;
}

async function runBestEffortMigrations() {
    try {
        logger.info({ context: "schema-bootstrap", path: STARTUP_MIGRATIONS_FOLDER }, "📍 Checking migrations folder...");

        if (!fs.existsSync(STARTUP_MIGRATIONS_FOLDER)) {
            throw new Error(`Migrations folder not found: ${STARTUP_MIGRATIONS_FOLDER}`);
        }

        await migrate(db, { migrationsFolder: STARTUP_MIGRATIONS_FOLDER });
        logger.info({ context: "schema-bootstrap" }, "✓ Migration check completed");
    } catch (error: any) {
        logger.error(
            { context: "schema-bootstrap", error: error.message, stack: error.stack },
            "❌ Migration step failed"
        );
        // We still continue to applyConsistencyChecks which might create basic tables
    }
}

async function ensureSiteSettingsInit(client: PoolClient) {
    const tableExists = await client.query<{ regclass: string | null }>(
        `SELECT to_regclass('public.site_settings') AS regclass;`
    );

    if (!tableExists.rows[0]?.regclass) {
        logger.info({ context: "schema-bootstrap" }, "Initializing site_settings table...");
        await client.query(`
      CREATE TABLE IF NOT EXISTS "site_settings" (
        "id" serial PRIMARY KEY NOT NULL,
        "isOpenToWork" boolean DEFAULT true NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL,
        "personalName" varchar(255) DEFAULT 'Your Name',
        "personalTitle" varchar(255) DEFAULT 'Full Stack Developer',
        "personalBio" text DEFAULT 'Passionate about building amazing products',
        "personalAvatar" varchar(500),
        "socialGithub" varchar(500),
        "socialLinkedin" varchar(500),
        "socialTwitter" varchar(500),
        "socialInstagram" varchar(500),
        "socialFacebook" varchar(500),
        "socialYoutube" varchar(500),
        "socialDiscord" varchar(500),
        "socialStackoverflow" varchar(500),
        "socialDevto" varchar(500),
        "socialMedium" varchar(500),
        "socialEmail" varchar(255),
        "heroGreeting" varchar(255) DEFAULT 'Hey, I am',
        "heroBadgeText" varchar(255) DEFAULT 'Available for work',
        "heroTaglines" jsonb DEFAULT '["Building amazing products", "Solving complex problems"]'::jsonb,
        "heroCtaPrimary" varchar(255) DEFAULT 'View My Work',
        "heroCtaPrimaryUrl" varchar(500) DEFAULT '#projects',
        "heroCtaSecondary" varchar(255) DEFAULT 'Get In Touch',
        "heroCtaSecondaryUrl" varchar(500) DEFAULT '#contact',
        "colorBackground" varchar(50) DEFAULT 'hsl(224, 71%, 4%)',
        "colorSurface" varchar(50) DEFAULT 'hsl(224, 71%, 10%)',
        "colorPrimary" varchar(50) DEFAULT 'hsl(263.4, 70%, 50.4%)',
        "colorSecondary" varchar(50) DEFAULT 'hsl(215.4, 16.3%, 46.9%)',
        "colorAccent" varchar(50) DEFAULT 'hsl(263.4, 70%, 50.4%)',
        "colorBorder" varchar(50) DEFAULT 'hsl(214.3, 31.8%, 91.4%)',
        "colorText" varchar(50) DEFAULT 'hsl(222.2, 84%, 95%)',
        "colorMuted" varchar(50) DEFAULT 'hsl(215.4, 16.3%, 46.9%)',
        "fontDisplay" varchar(255) DEFAULT 'Inter',
        "fontBody" varchar(255) DEFAULT 'Inter',
        "customCss" text,
        "navbarLinks" jsonb DEFAULT '[]'::jsonb,
        "footerCopyright" varchar(255) DEFAULT '© 2024 Your Name. All rights reserved.',
        "footerTagline" varchar(500) DEFAULT 'Building the future, one line of code at a time.',
        "sectionOrder" jsonb DEFAULT '["hero", "about", "projects", "skills", "testimonials", "contact"]'::jsonb,
        "sectionVisibility" jsonb DEFAULT '{"hero": true, "about": true, "projects": true, "skills": true, "testimonials": true, "contact": true}'::jsonb,
        "featureBlog" boolean DEFAULT true NOT NULL,
        "featureGuestbook" boolean DEFAULT true NOT NULL,
        "featureTestimonials" boolean DEFAULT true NOT NULL,
        "featureServices" boolean DEFAULT true NOT NULL,
        "featurePlayground" boolean DEFAULT false NOT NULL
      );
    `);
    }
}

async function applyConsistencyChecks() {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await ensureSiteSettingsInit(client);
        await client.query("COMMIT");
        logger.info({ context: "schema-bootstrap" }, "✓ Consistency checks complete");
    } catch (error) {
        await client.query("ROLLBACK");
        logger.error({ context: "schema-bootstrap", error }, "Consistency check failed");
        // Don't throw here to allow app to start if migrations succeeded
    } finally {
        client.release();
    }
}

export async function bootstrapDatabaseSchema() {
    // 1. Run migrations first (primary method)
    await runBestEffortMigrations();

    // 2. Run light consistency checks/init (secondary safety net)
    await applyConsistencyChecks();
}

