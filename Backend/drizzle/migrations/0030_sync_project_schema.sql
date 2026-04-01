-- Migration: Sync projects table with shared schema
-- Ensures all columns from packages/shared/src/schema.ts exist in the projects table.

DO $$ 
BEGIN 
    -- 1. Ensure slug exists (already in 0016, but safe to check)
    BEGIN
        ALTER TABLE "projects" ADD COLUMN "slug" varchar(255) DEFAULT '' NOT NULL;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- 2. Ensure longDescription exists (already in 0016, but safe to check)
    BEGIN
        ALTER TABLE "projects" ADD COLUMN "longDescription" text;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- 3. Ensure viewCount exists (MISSING from previous migrations)
    BEGIN
        ALTER TABLE "projects" ADD COLUMN "viewCount" integer DEFAULT 0 NOT NULL;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- 4. Ensure healthCheckUrl exists (MISSING from previous migrations)
    BEGIN
        ALTER TABLE "projects" ADD COLUMN "healthCheckUrl" varchar(500);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- 5. Ensure summary exists (Added in 0027, but ensuring consistency)
    BEGIN
        ALTER TABLE "projects" ADD COLUMN "summary" text;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- 6. Ensure imageAlt exists (MISSING from 0027's sync)
    BEGIN
        ALTER TABLE "projects" ADD COLUMN "imageAlt" text;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- 7. Ensure isFlagship exists (In 0027, but safe)
    BEGIN
        ALTER TABLE "projects" ADD COLUMN "isFlagship" boolean DEFAULT false NOT NULL;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- 8. Ensure isHidden exists (In 0027, but safe)
    BEGIN
        ALTER TABLE "projects" ADD COLUMN "isHidden" boolean DEFAULT false NOT NULL;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- 9. Ensure impact and role exist (In 0000 but re-checked in 0027, safe)
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

    -- 10. Ensure timestamps exist (In 0016, but safe)
    BEGIN
        ALTER TABLE "projects" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "projects" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

END $$;
