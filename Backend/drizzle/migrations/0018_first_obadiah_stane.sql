-- Migration: 0018_first_obadiah_stane
-- Purpose: Add 'locationText' field to site_settings table.

ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "locationText" varchar(255) DEFAULT 'Kathmandu, Nepal';