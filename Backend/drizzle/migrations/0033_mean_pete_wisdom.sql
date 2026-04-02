-- Backfill messages consent logic and reconcile inconsistencies
UPDATE "messages" SET "consentStatus" = 'pending' WHERE "consentStatus" IS NULL;--> statement-breakpoint
UPDATE "messages" SET "consentGiven" = false WHERE "consentGiven" IS NULL;--> statement-breakpoint
-- Reconcile: Ensure consentGiven matches consentStatus before adding check constraint
UPDATE "messages" SET "consentGiven" = true WHERE "consentStatus" = 'given';--> statement-breakpoint
UPDATE "messages" SET "consentGiven" = false WHERE "consentStatus" IN ('pending', 'declined', 'withdrawn');--> statement-breakpoint

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
-- 16: Idempotent column adds
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_log' AND column_name='retention_until') THEN 
    ALTER TABLE "audit_log" ADD COLUMN "retention_until" timestamp; 
END IF; END $$; 
--> statement-breakpoint

-- 17: Robust Singleton Guard for site_settings
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='singleton_guard') THEN 
        ALTER TABLE "site_settings" ADD COLUMN "singleton_guard" integer; 
    END IF; 

    -- Ensure exactly one row exists (for singleton behavior)
    IF (SELECT count(*) FROM "site_settings") > 1 THEN
        DELETE FROM "site_settings" WHERE id NOT IN (SELECT id FROM "site_settings" ORDER BY id LIMIT 1);
    ELSIF (SELECT count(*) FROM "site_settings") = 0 THEN
        INSERT INTO "site_settings" ("updatedAt") VALUES (now());
    END IF;

    UPDATE "site_settings" SET "singleton_guard" = 1;
END $$;
--> statement-breakpoint

-- 18: Index with existence check
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='articles' AND indexname='articles_authorId_idx') THEN
    CREATE INDEX "articles_authorId_idx" ON "articles" USING btree ("authorId");
END IF; END $$;
--> statement-breakpoint

-- 21: Constraints with safety
ALTER TABLE "site_settings" ALTER COLUMN "singleton_guard" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ALTER COLUMN "singleton_guard" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "site_settings" DROP CONSTRAINT IF EXISTS "site_settings_singleton_guard_unique";--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_singleton_guard_unique" UNIQUE("singleton_guard");--> statement-breakpoint
ALTER TABLE "site_settings" DROP CONSTRAINT IF EXISTS "site_settings_singleton_guard_check";--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_singleton_guard_check" CHECK ("singleton_guard" = 1);--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_consent_consistency";--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_consent_consistency" CHECK (("consentStatus" = 'given' AND "consentGiven" = true) OR ("consentStatus" IN ('pending', 'declined', 'withdrawn') AND "consentGiven" = false));