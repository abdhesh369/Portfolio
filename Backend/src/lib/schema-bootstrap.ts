import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { PoolClient } from "pg";
import { db, pool } from "../db.js";
import { logger } from "./logger.js";
import path from "path";
import fs from "fs";

// Resolve migrations folder — works both when cwd is Backend/ or the monorepo root
const migrationsCandidates = [
    path.resolve(process.cwd(), "drizzle/migrations"),
    path.resolve(process.cwd(), "Backend/drizzle/migrations"),
];
const STARTUP_MIGRATIONS_FOLDER = migrationsCandidates.find(p => fs.existsSync(p)) ?? migrationsCandidates[0];


async function runBestEffortMigrations() {
    try {
        logger.info({ context: "schema-bootstrap", path: STARTUP_MIGRATIONS_FOLDER }, "📍 Checking migrations folder...");

        if (!fs.existsSync(STARTUP_MIGRATIONS_FOLDER)) {
            // Only warn, don't throw. In some test environments, migrations folder might be missing but DB is pre-seeded.
            logger.warn({ context: "schema-bootstrap" }, "Migrations folder missing - skipping automated migration");
            return;
        }

        await migrate(db, { migrationsFolder: STARTUP_MIGRATIONS_FOLDER });
        logger.info({ context: "schema-bootstrap" }, "✓ Migration check completed");
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        
        // Specific handling for "CREATE SCHEMA" failure which can happen on some managed PG providers
        if (message.includes('CREATE SCHEMA IF NOT EXISTS "drizzle"')) {
            logger.warn({ context: "schema-bootstrap" }, "⚠️  Could not manage 'drizzle' schema - assuming tables are already migrated or using external management.");
            return;
        }

        logger.error(
            { context: "schema-bootstrap", error: message },
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
        "availabilityStatus" varchar(255),
        "updatedAt" timestamp DEFAULT now() NOT NULL,
        "personalName" varchar(255) DEFAULT 'Your Name',
        "personalTitle" varchar(255) DEFAULT 'Full Stack Developer',
        "personalBio" text DEFAULT 'Passionate about building amazing products',
        "personalAvatar" varchar(500),
        "resumeUrl" varchar(500),
        "whyHireMeData" jsonb,
        "aboutAvailability" varchar(255) DEFAULT 'Open to Work',
        "aboutDescription" text DEFAULT 'Building scalable web systems and analyzing complex algorithms.',
        "aboutTechStack" jsonb DEFAULT '["React", "Node.js", "TypeScript", "PostgreSQL", "Tailwind"]'::jsonb,
        "aboutTimeline" jsonb DEFAULT '[{"year": "2024 - Present", "title": "Advanced System Design", "description": "Deep diving into distributed systems, Docker, and Microservices architecture."}, {"year": "2023", "title": "Engineering Core", "description": "Mastering Data Structures, Algorithms, and OOP at Tribhuvan University."}, {"year": "2022", "title": "Hello World", "description": "Started the journey with Python scripting and basic web development."}]'::jsonb,
        "aboutInfoCards" jsonb DEFAULT '[{"icon": "GraduationCap", "label": "Status", "value": "B.E. Student"}, {"icon": "Code", "label": "Focus Area", "value": "Full Stack System Design", "color": "purple"}, {"icon": "Cpu", "label": "Hardware", "value": "Electronics & Comms", "color": "purple"}, {"icon": "Target", "label": "Goal", "value": "Software Engineer"}]'::jsonb,
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
        "locationText" varchar(255) DEFAULT 'Kathmandu, Nepal',
        "chatbotGreeting" text DEFAULT 'Hi there! I''m Abdhesh''s AI assistant. How can I help you today?',
        "heroGreeting" varchar(255) DEFAULT 'Hey, I am',
        "heroBadgeText" varchar(255) DEFAULT 'Available for work',
        "heroTaglines" jsonb DEFAULT '["Building amazing products", "Solving complex problems"]'::jsonb,
        "heroHeadingLine1" varchar(255) DEFAULT 'Start building',
        "heroHeadingLine2" varchar(255) DEFAULT 'The Future',
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
        "logoText" varchar(255) DEFAULT 'Portfolio.Dev',
        "navbarLinks" jsonb DEFAULT '[]'::jsonb,
        "footerCopyright" varchar(255) DEFAULT '© 2024 Your Name. All rights reserved.',
        "footerTagline" varchar(500) DEFAULT 'Building the future, one line of code at a time.',
        "sectionOrder" jsonb DEFAULT '["hero", "about", "projects", "skills", "whyhireme", "services", "mindset", "projects", "practice", "experience", "guestbook", "contact", "testimonials"]'::jsonb,
        "sectionVisibility" jsonb DEFAULT '{"hero": true, "about": true, "projects": true, "skills": true, "whyhireme": true, "services": true, "mindset": true, "practice": true, "experience": true, "testimonials": true, "guestbook": true, "contact": true}'::jsonb,
        "availabilitySlots" jsonb DEFAULT '[]'::jsonb,
        "featureBlog" boolean DEFAULT true NOT NULL,
        "featureGuestbook" boolean DEFAULT true NOT NULL,
        "featureTestimonials" boolean DEFAULT true NOT NULL,
        "featureServices" boolean DEFAULT true NOT NULL,
        "featurePlayground" boolean DEFAULT false NOT NULL,
        "aboutHeading" varchar(255) DEFAULT 'About Me',
        "projectsHeading" varchar(255) DEFAULT 'Flagship Projects',
        "skillsHeading" varchar(255) DEFAULT 'Technical Arsenal',
        "whyHireMeHeading" varchar(255) DEFAULT 'Why Hire Me',
        "servicesHeading" varchar(255) DEFAULT 'What I Do',
        "mindsetHeading" varchar(255) DEFAULT 'Engineering Mindset',
        "practiceHeading" varchar(255) DEFAULT 'Disciplined Practice',
        "experienceHeading" varchar(255) DEFAULT 'Professional Journey',
        "testimonialsHeading" varchar(255) DEFAULT 'Client Feedback',
        "guestbookHeading" varchar(255) DEFAULT 'Guestbook',
        "contactHeading" varchar(255) DEFAULT 'Get In Touch'
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

