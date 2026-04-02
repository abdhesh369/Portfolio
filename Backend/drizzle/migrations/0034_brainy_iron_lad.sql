ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_consent_consistency";--> statement-breakpoint

DO $$ 
BEGIN 
    -- 1. Safe existence-aware add for site_settings appearance columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='colorBackground') THEN
        ALTER TABLE "site_settings" ADD COLUMN "colorBackground" varchar(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='colorSurface') THEN
        ALTER TABLE "site_settings" ADD COLUMN "colorSurface" varchar(50); 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='colorPrimary') THEN
        ALTER TABLE "site_settings" ADD COLUMN "colorPrimary" varchar(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='colorSecondary') THEN
        ALTER TABLE "site_settings" ADD COLUMN "colorSecondary" varchar(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='colorAccent') THEN
        ALTER TABLE "site_settings" ADD COLUMN "colorAccent" varchar(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='colorBorder') THEN
        ALTER TABLE "site_settings" ADD COLUMN "colorBorder" varchar(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='colorText') THEN
        ALTER TABLE "site_settings" ADD COLUMN "colorText" varchar(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='colorMuted') THEN
        ALTER TABLE "site_settings" ADD COLUMN "colorMuted" varchar(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='fontDisplay') THEN
        ALTER TABLE "site_settings" ADD COLUMN "fontDisplay" varchar(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='fontBody') THEN
        ALTER TABLE "site_settings" ADD COLUMN "fontBody" varchar(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='customCss') THEN
        ALTER TABLE "site_settings" ADD COLUMN "customCss" text;
    END IF;

    -- 2. Ensure singleton_guard exists (Fix for skipped 0033 logic)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='singleton_guard') THEN
        ALTER TABLE "site_settings" ADD COLUMN "singleton_guard" integer DEFAULT 1;
    END IF;

    -- 3. Reconcile singleton row
    IF (SELECT count(*) FROM "site_settings") > 1 THEN
        DELETE FROM "site_settings" WHERE id NOT IN (SELECT id FROM "site_settings" ORDER BY id LIMIT 1);
    ELSIF (SELECT count(*) FROM "site_settings") = 0 THEN
        INSERT INTO "site_settings" ("updatedAt", "singleton_guard") VALUES (now(), 1);
    END IF;
    UPDATE "site_settings" SET "singleton_guard" = 1;

    -- 4. Clean up duplicate skill connections before adding unique constraint
    DELETE FROM "skill_connections" a USING "skill_connections" b
    WHERE a.id > b.id 
    AND a."fromSkillId" = b."fromSkillId" 
    AND a."toSkillId" = b."toSkillId";

    -- 5. Reconcile messages consent before adding check constraint
    UPDATE "messages" SET "consentStatus" = 'pending' WHERE "consentStatus" IS NULL;
    UPDATE "messages" SET "consentGiven" = false WHERE "consentGiven" IS NULL;
    UPDATE "messages" SET "consentGiven" = true WHERE "consentStatus" = 'given';
    UPDATE "messages" SET "consentGiven" = false WHERE "consentStatus" IN ('pending', 'declined', 'withdrawn');

    -- 6. Clean up other legacy columns
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='token') THEN
        ALTER TABLE "clients" DROP COLUMN "token";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seo_settings' AND column_name='twitterCard') THEN
        ALTER TABLE "seo_settings" DROP COLUMN "twitterCard";
    END IF;
END $$;--> statement-breakpoint

-- Ensure constraints are correctly applied
ALTER TABLE "skill_connections" DROP CONSTRAINT IF EXISTS "skill_connections_fromSkillId_toSkillId_unique";--> statement-breakpoint
ALTER TABLE "skill_connections" ADD CONSTRAINT "skill_connections_fromSkillId_toSkillId_unique" UNIQUE("fromSkillId","toSkillId");--> statement-breakpoint

ALTER TABLE "messages" ADD CONSTRAINT "messages_consent_consistency" CHECK (("consentStatus" = 'given' AND "consentGiven" = true) OR ("consentStatus" IN ('pending', 'declined', 'withdrawn') AND "consentGiven" = false));--> statement-breakpoint

ALTER TABLE "site_settings" DROP CONSTRAINT IF EXISTS "site_settings_singleton_guard_check";--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_singleton_guard_check" CHECK ("singleton_guard" = 1);