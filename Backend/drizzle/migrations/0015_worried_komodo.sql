-- Migration: 0015_worried_komodo
-- Purpose: Re-add the 'reactions' column to the guestbook table with JSONB type.

ALTER TABLE "guestbook" ADD COLUMN "reactions" jsonb DEFAULT '{}'::jsonb;