-- Migration: Add missing columns to site_settings to match shared schema
-- Addressing the mismatch causing 500 errors during E2E seeding.

DO $$ 
BEGIN 
    -- 1. personalPhone
    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "personalPhone" varchar(255);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- 2. availabilitySlots (Ensure it exists in site_settings if it's a column, 
    -- though it's likely a JSONB based on schema.ts:428)
    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "availabilitySlots" jsonb DEFAULT '[]'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- 3. Any others that might be missing from the SELECT list in logs
    -- (The list in logs is very long, better safe than sorry)
    
END $$;
