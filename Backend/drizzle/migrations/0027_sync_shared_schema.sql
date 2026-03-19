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
END $$;
