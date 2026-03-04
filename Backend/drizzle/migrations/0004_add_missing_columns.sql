-- Add missing columns that exist in Drizzle schema but not in the database
-- projects.imageAlt (causes 500 on /api/v1/projects)
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "imageAlt" text;

-- articles.featuredImageAlt (may already exist if added manually)
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "featuredImageAlt" text;
