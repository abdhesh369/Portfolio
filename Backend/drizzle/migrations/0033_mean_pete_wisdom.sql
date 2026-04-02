-- Backfill messages consent logic
UPDATE "messages" SET "consentStatus" = 'pending' WHERE "consentStatus" IS NULL;--> statement-breakpoint
UPDATE "messages" SET "consentGiven" = false WHERE "consentGiven" IS NULL;--> statement-breakpoint

-- Backfill users data
UPDATE "users" SET "role" = 'viewer' WHERE "role" IS NULL;--> statement-breakpoint
UPDATE "users" SET "permissions" = '[]'::jsonb WHERE "permissions" IS NULL;--> statement-breakpoint
UPDATE "users" SET "status" = 'active' WHERE "status" IS NULL;--> statement-breakpoint

-- Existing ALTER declarations
ALTER TABLE "messages" ALTER COLUMN "consentStatus" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "consentGiven" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "permissions" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "retention_until" timestamp;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "singleton_guard" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE INDEX "articles_authorId_idx" ON "articles" USING btree ("authorId");--> statement-breakpoint

-- New Constraints
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_singleton_guard_unique" UNIQUE("singleton_guard");--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_singleton_guard_check" CHECK ("singleton_guard" = 1);--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_consent_consistency" CHECK (("consentStatus" = 'given' AND "consentGiven" = true) OR ("consentStatus" IN ('pending', 'declined', 'withdrawn') AND "consentGiven" = false));