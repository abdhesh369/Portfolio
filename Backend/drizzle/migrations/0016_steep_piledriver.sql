-- Migration: 0016_steep_piledriver
-- Purpose: Add slug, longDescription, and timestamps to projects table; add article author foreign key.

ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "slug" varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "longDescription" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "createdAt" timestamp;--> statement-breakpoint
UPDATE "projects" SET "createdAt" = now() WHERE "createdAt" IS NULL;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "createdAt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");--> statement-breakpoint
