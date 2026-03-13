-- Migration: 0021_fix_column_mismatches
-- Purpose: Add missing 'summary' column to projects and rename 'search_vector' to 'searchVector' in articles.

-- Table: projects
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "summary" text;

-- Table: articles
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='articles' AND column_name='search_vector') THEN
    ALTER TABLE "articles" RENAME COLUMN "search_vector" TO "searchVector";
  END IF;
END $$;
