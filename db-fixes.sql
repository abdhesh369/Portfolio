-- Run this SQL in Neon console

-- 12. Blog posts missing estimated reading time for existing articles
UPDATE articles 
SET "readTimeMinutes" = GREATEST(1, CEIL(
  array_length(string_to_array(content, ' '), 1) / 200.0
))
WHERE "readTimeMinutes" = 0 AND content IS NOT NULL;

-- 13. Project slugs may still be empty in DB
UPDATE projects 
SET slug = lower(regexp_replace(
  regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), 
  '\s+', '-', 'g'
))
WHERE slug = '' 
  OR slug !~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$' 
  OR length(slug) < 3;

-- 14. Create subscribers table if not exists
CREATE TABLE IF NOT EXISTS "subscribers" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "status" VARCHAR(50) NOT NULL DEFAULT 'active',
  "source" VARCHAR(100),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
