ALTER TABLE "messages" ALTER COLUMN "consentStatus" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "consentGiven" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "permissions" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "retention_until" timestamp;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "singleton_guard" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE INDEX "articles_authorId_idx" ON "articles" USING btree ("authorId");--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_singleton_guard_unique" UNIQUE("singleton_guard");--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_consent_consistency" CHECK (("consentStatus" = 'given' AND "consentGiven" = true) OR ("consentStatus" != 'given' AND "consentGiven" = false));