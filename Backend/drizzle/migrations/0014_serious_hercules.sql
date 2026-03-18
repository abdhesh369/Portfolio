-- Migration: 0014_serious_hercules
-- Purpose: Remove the 'reactions' column from the guestbook table.
-- Note: This matches a temporary schema reversion.

ALTER TABLE "guestbook" DROP COLUMN IF EXISTS "reactions";