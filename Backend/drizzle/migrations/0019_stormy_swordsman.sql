-- Migration: 0019_stormy_swordsman
-- Purpose: Add 'resumeUrl' and 'whyHireMeData' fields to site_settings table.

ALTER TABLE "site_settings" ADD COLUMN "resumeUrl" varchar(500);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "whyHireMeData" jsonb;