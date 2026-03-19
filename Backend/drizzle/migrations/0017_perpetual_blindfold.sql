-- Purpose: Schema normalization: drop old constraints, update experience defaults, add project/site settings fields.

DO $$
BEGIN
  -- skill_connections renames
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='skill_connections' AND column_name='from_skill_id') THEN
    ALTER TABLE "skill_connections" RENAME COLUMN "from_skill_id" TO "fromSkillId";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='skill_connections' AND column_name='to_skill_id') THEN
    ALTER TABLE "skill_connections" RENAME COLUMN "to_skill_id" TO "toSkillId";
  END IF;

  -- seo_settings renames
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seo_settings' AND column_name='page_slug') THEN
    ALTER TABLE "seo_settings" RENAME COLUMN "page_slug" TO "pageSlug";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seo_settings' AND column_name='meta_title') THEN
    ALTER TABLE "seo_settings" RENAME COLUMN "meta_title" TO "metaTitle";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seo_settings' AND column_name='meta_description') THEN
    ALTER TABLE "seo_settings" RENAME COLUMN "meta_description" TO "metaDescription";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seo_settings' AND column_name='og_title') THEN
    ALTER TABLE "seo_settings" RENAME COLUMN "og_title" TO "ogTitle";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seo_settings' AND column_name='og_description') THEN
    ALTER TABLE "seo_settings" RENAME COLUMN "og_description" TO "ogDescription";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seo_settings' AND column_name='og_image') THEN
    ALTER TABLE "seo_settings" RENAME COLUMN "og_image" TO "ogImage";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seo_settings' AND column_name='canonical_url') THEN
    ALTER TABLE "seo_settings" RENAME COLUMN "canonical_url" TO "canonicalUrl";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seo_settings' AND column_name='created_at') THEN
    ALTER TABLE "seo_settings" RENAME COLUMN "created_at" TO "createdAt";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seo_settings' AND column_name='updated_at') THEN
    ALTER TABLE "seo_settings" RENAME COLUMN "updated_at" TO "updatedAt";
  END IF;

  -- audit_log renames
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_log' AND column_name='entity_id') THEN
    ALTER TABLE "audit_log" RENAME COLUMN "entity_id" TO "entityId";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_log' AND column_name='old_values') THEN
    ALTER TABLE "audit_log" RENAME COLUMN "old_values" TO "oldValues";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_log' AND column_name='new_values') THEN
    ALTER TABLE "audit_log" RENAME COLUMN "new_values" TO "newValues";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_log' AND column_name='created_at') THEN
    ALTER TABLE "audit_log" RENAME COLUMN "created_at" TO "createdAt";
  END IF;
END $$;
--> statement-breakpoint

ALTER TABLE "seo_settings" DROP CONSTRAINT IF EXISTS "seo_settings_page_slug_unique";--> statement-breakpoint
ALTER TABLE "skill_connections" DROP CONSTRAINT IF EXISTS "skill_connections_from_to_unique";--> statement-breakpoint
ALTER TABLE "articles" DROP CONSTRAINT IF EXISTS "articles_authorId_authors_id_fk";
--> statement-breakpoint
ALTER TABLE "skill_connections" DROP CONSTRAINT IF EXISTS "skill_connections_from_skill_id_skills_id_fk";
--> statement-breakpoint
ALTER TABLE "skill_connections" DROP CONSTRAINT IF EXISTS "skill_connections_to_skill_id_skills_id_fk";

--> statement-breakpoint
ALTER TABLE "experiences" ALTER COLUMN "startDate" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "experiences" ADD COLUMN IF NOT EXISTS "period" varchar(100);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "logoText" varchar(255) DEFAULT 'Portfolio.Dev';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "heroHeadingLine1" varchar(255) DEFAULT 'Start building';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "heroHeadingLine2" varchar(255) DEFAULT 'The Future';
--> statement-breakpoint
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'skill_connections_fromSkillId_skills_id_fk') THEN
        ALTER TABLE "skill_connections" ADD CONSTRAINT "skill_connections_fromSkillId_skills_id_fk" FOREIGN KEY ("fromSkillId") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'skill_connections_toSkillId_skills_id_fk') THEN
        ALTER TABLE "skill_connections" ADD CONSTRAINT "skill_connections_toSkillId_skills_id_fk" FOREIGN KEY ("toSkillId") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;
    END IF;
END $$;
--> statement-breakpoint
CREATE INDEX "code_reviews_processing_idx" ON "code_reviews" USING btree ("projectId") WHERE status = 'processing';--> statement-breakpoint
ALTER TABLE "seo_settings" ADD CONSTRAINT "seo_settings_pageSlug_unique" UNIQUE("pageSlug");
