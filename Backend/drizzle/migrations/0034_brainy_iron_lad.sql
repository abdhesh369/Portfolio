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

    -- 2. Clean up other legacy columns
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