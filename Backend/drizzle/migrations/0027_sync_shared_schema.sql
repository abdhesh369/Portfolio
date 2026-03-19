-- Migration: Sync shared schema after missing migrations
-- Includes reading_list table and column renames for consistency with @portfolio/shared

-- 1. Create reading_list table if it doesn't exist
CREATE TABLE IF NOT EXISTS "reading_list" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"url" varchar(500) NOT NULL,
	"note" text,
	"type" varchar(50) DEFAULT 'article' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);

-- 2. Fix projects column names (CamelCase -> lowercase/snake_case as per shared schema)
-- Note: Using DO block to check for existence before renaming to avoid errors if already pushed
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='isFlagship') THEN
    ALTER TABLE "projects" RENAME COLUMN "isFlagship" TO "isflagship";
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='isHidden') THEN
    ALTER TABLE "projects" RENAME COLUMN "isHidden" TO "ishidden";
  END IF;
END $$;
