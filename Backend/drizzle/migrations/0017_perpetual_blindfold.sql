-- Migration: 0017_perpetual_blindfold
-- Purpose: Schema normalization: drop old constraints, update experience defaults, add project/site settings fields.

ALTER TABLE "seo_settings" DROP CONSTRAINT "seo_settings_page_slug_unique";--> statement-breakpoint
ALTER TABLE "skill_connections" DROP CONSTRAINT "skill_connections_from_to_unique";--> statement-breakpoint
ALTER TABLE "articles" DROP CONSTRAINT "articles_authorId_authors_id_fk";
--> statement-breakpoint
ALTER TABLE "skill_connections" DROP CONSTRAINT "skill_connections_from_skill_id_skills_id_fk";
--> statement-breakpoint
ALTER TABLE "skill_connections" DROP CONSTRAINT "skill_connections_to_skill_id_skills_id_fk";
--> statement-breakpoint
ALTER TABLE "experiences" ALTER COLUMN "startDate" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "experiences" ADD COLUMN "period" varchar(100);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "logoText" varchar(255) DEFAULT 'Portfolio.Dev';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "heroHeadingLine1" varchar(255) DEFAULT 'Start building';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "heroHeadingLine2" varchar(255) DEFAULT 'The Future';--> statement-breakpoint
ALTER TABLE "skill_connections" ADD CONSTRAINT "skill_connections_fromSkillId_skills_id_fk" FOREIGN KEY ("fromSkillId") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_connections" ADD CONSTRAINT "skill_connections_toSkillId_skills_id_fk" FOREIGN KEY ("toSkillId") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "code_reviews_processing_idx" ON "code_reviews" USING btree ("projectId") WHERE status = 'processing';--> statement-breakpoint
ALTER TABLE "seo_settings" ADD CONSTRAINT "seo_settings_pageSlug_unique" UNIQUE("pageSlug");