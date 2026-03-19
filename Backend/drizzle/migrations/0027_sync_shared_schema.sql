-- Migration: Synchronize shared schema columns
-- Ensures missing columns in 'projects' and the entire 'reading_list' table exist.

-- 1. Create reading_list table if it doesn't exist
CREATE TABLE IF NOT EXISTS "reading_list" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"url" varchar(500) NOT NULL,
	"note" text,
	"type" varchar(50) DEFAULT 'article' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);

-- 2. Ensure missing columns in projects table exist (using DO blocks for safety)
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE "projects" ADD COLUMN "summary" text;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "projects" ADD COLUMN "impact" text;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "projects" ADD COLUMN "role" text;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "projects" ADD COLUMN "imageAlt" text;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "projects" ADD COLUMN "isFlagship" boolean DEFAULT false NOT NULL;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "projects" ADD COLUMN "isHidden" boolean DEFAULT false NOT NULL;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- Skills missing columns
    BEGIN
        ALTER TABLE "skills" ADD COLUMN "mastery" integer DEFAULT 0 NOT NULL;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "skills" ADD COLUMN "endorsements" integer DEFAULT 0 NOT NULL;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- Testimonials missing columns
    BEGIN
        ALTER TABLE "testimonials" ADD COLUMN "linkedinUrl" varchar(500);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- Experiences missing columns
    BEGIN
        ALTER TABLE "experiences" ADD COLUMN "startDate" timestamp DEFAULT now() NOT NULL;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "experiences" ADD COLUMN "endDate" timestamp;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    -- Analytics missing columns
    BEGIN
        ALTER TABLE "analytics" ADD COLUMN "referral" varchar(255);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- Guestbook missing columns
    BEGIN
        ALTER TABLE "guestbook" ADD COLUMN "reactions" jsonb DEFAULT '{}'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- Articles missing columns
    BEGIN
        ALTER TABLE "articles" ADD COLUMN "reactions" jsonb DEFAULT '{}'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- Site Settings missing columns
    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "availabilityStatus" varchar(255);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "aboutAvailability" varchar(255) DEFAULT 'Open to Work';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "aboutDescription" text DEFAULT 'Building scalable web systems and analyzing complex algorithms.';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "aboutTechStack" jsonb DEFAULT '["React", "Node.js", "TypeScript", "PostgreSQL", "Tailwind"]'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "aboutTimeline" jsonb DEFAULT '[{"year": "2024 - Present", "title": "Advanced System Design", "description": "Deep diving into distributed systems, Docker, and Microservices architecture."}, {"year": "2023", "title": "Engineering Core", "description": "Mastering Data Structures, Algorithms, and OOP at Tribhuvan University."}, {"year": "2022", "title": "Hello World", "description": "Started the journey with Python scripting and basic web development."}]'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "aboutInfoCards" jsonb DEFAULT '[{"icon": "GraduationCap", "label": "Status", "value": "B.E. Student"}, {"icon": "Code", "label": "Focus Area", "value": "Full Stack System Design", "color": "purple"}, {"icon": "Cpu", "label": "Hardware", "value": "Electronics & Comms", "color": "purple"}, {"icon": "Target", "label": "Goal", "value": "Software Engineer"}]'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- ... Add other site_settings columns if needed, but start with the one reported as missing
    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "personalName" varchar(255) DEFAULT 'Your Name';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "personalTitle" varchar(255) DEFAULT 'Full Stack Developer';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "personalBio" text DEFAULT 'Passionate about building amazing products';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "resumeUrl" varchar(500);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "socialEmail" varchar(255);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "sectionOrder" jsonb DEFAULT '["hero", "about", "skills", "whyhireme", "services", "mindset", "projects", "practice", "experience", "guestbook", "contact", "testimonials"]'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "sectionVisibility" jsonb DEFAULT '{"hero": true, "about": true, "projects": true, "skills": true, "whyhireme": true, "services": true, "mindset": true, "practice": true, "experience": true, "testimonials": true, "guestbook": true, "contact": true}'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;
