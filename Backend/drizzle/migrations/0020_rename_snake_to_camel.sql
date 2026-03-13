-- Migration: 0020_rename_snake_to_camel
-- Purpose: Records column renames (snake_case to camelCase) that were previously applied manually to the production database via the deleted fix-db-schema.ts script.
-- Applied: see git log

-- Table: seo_settings
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seo_settings' AND column_name='page_slug') THEN
    ALTER TABLE "seo_settings" RENAME COLUMN "page_slug" TO "pageSlug";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seo_settings' AND column_name='meta_title') THEN
    ALTER TABLE "seo_settings" RENAME COLUMN "meta_title" TO "metaTitle";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seo_settings' AND column_name='meta_description') THEN
    ALTER TABLE "seo_settings" RENAME COLUMN "meta_description" TO "metaDescription";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seo_settings' AND column_name='og_title') THEN
    ALTER TABLE "seo_settings" RENAME COLUMN "og_title" TO "ogTitle";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seo_settings' AND column_name='og_description') THEN
    ALTER TABLE "seo_settings" RENAME COLUMN "og_description" TO "ogDescription";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seo_settings' AND column_name='og_image') THEN
    ALTER TABLE "seo_settings" RENAME COLUMN "og_image" TO "ogImage";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seo_settings' AND column_name='canonical_url') THEN
    ALTER TABLE "seo_settings" RENAME COLUMN "canonical_url" TO "canonicalUrl";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seo_settings' AND column_name='twitter_card') THEN
    ALTER TABLE "seo_settings" RENAME COLUMN "twitter_card" TO "twitterCard";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seo_settings' AND column_name='created_at') THEN
    ALTER TABLE "seo_settings" RENAME COLUMN "created_at" TO "createdAt";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seo_settings' AND column_name='updated_at') THEN
    ALTER TABLE "seo_settings" RENAME COLUMN "updated_at" TO "updatedAt";
  END IF;
END $$;
--> statement-breakpoint

-- Table: skill_connections
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='skill_connections' AND column_name='from_skill_id') THEN
    ALTER TABLE "skill_connections" RENAME COLUMN "from_skill_id" TO "fromSkillId";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='skill_connections' AND column_name='to_skill_id') THEN
    ALTER TABLE "skill_connections" RENAME COLUMN "to_skill_id" TO "toSkillId";
  END IF;
END $$;
--> statement-breakpoint

-- Table: projects
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='isFlagship') THEN
    ALTER TABLE "projects" RENAME COLUMN "isFlagship" TO "isflagship";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='display_order') THEN
    ALTER TABLE "projects" RENAME COLUMN "display_order" TO "displayOrder";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='image_url') THEN
    ALTER TABLE "projects" RENAME COLUMN "image_url" TO "imageUrl";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='github_url') THEN
    ALTER TABLE "projects" RENAME COLUMN "github_url" TO "githubUrl";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='live_url') THEN
    ALTER TABLE "projects" RENAME COLUMN "live_url" TO "liveUrl";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='view_count') THEN
    ALTER TABLE "projects" RENAME COLUMN "view_count" TO "viewCount";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='created_at') THEN
    ALTER TABLE "projects" RENAME COLUMN "created_at" TO "createdAt";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='updated_at') THEN
    ALTER TABLE "projects" RENAME COLUMN "updated_at" TO "updatedAt";
  END IF;
END $$;
--> statement-breakpoint

-- Table: articles
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='articles' AND column_name='featured_image') THEN
    ALTER TABLE "articles" RENAME COLUMN "featured_image" TO "featuredImage";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='articles' AND column_name='published_at') THEN
    ALTER TABLE "articles" RENAME COLUMN "published_at" TO "publishedAt";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='articles' AND column_name='view_count') THEN
    ALTER TABLE "articles" RENAME COLUMN "view_count" TO "viewCount";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='articles' AND column_name='read_time_minutes') THEN
    ALTER TABLE "articles" RENAME COLUMN "read_time_minutes" TO "readTimeMinutes";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='articles' AND column_name='author_id') THEN
    ALTER TABLE "articles" RENAME COLUMN "author_id" TO "authorId";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='articles' AND column_name='featured_image_alt') THEN
    ALTER TABLE "articles" RENAME COLUMN "featured_image_alt" TO "featuredImageAlt";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='articles' AND column_name='created_at') THEN
    ALTER TABLE "articles" RENAME COLUMN "created_at" TO "createdAt";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='articles' AND column_name='updated_at') THEN
    ALTER TABLE "articles" RENAME COLUMN "updated_at" TO "updatedAt";
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "reactions" JSONB DEFAULT '{}'::jsonb NOT NULL;
--> statement-breakpoint

-- Table: site_settings
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='is_open_to_work') THEN
    ALTER TABLE "site_settings" RENAME COLUMN "is_open_to_work" TO "isOpenToWork";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='updated_at') THEN
    ALTER TABLE "site_settings" RENAME COLUMN "updated_at" TO "updatedAt";
  END IF;
END $$;
