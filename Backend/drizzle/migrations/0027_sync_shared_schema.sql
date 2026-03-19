-- Migration: Create missing reading_list table
-- Note: Column casing for projects (isFlagship, isHidden) is handled via shared schema alignment.

-- 1. Create reading_list table if it doesn't exist
CREATE TABLE IF NOT EXISTS "reading_list" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"url" varchar(500) NOT NULL,
	"note" text,
	"type" varchar(50) DEFAULT 'article' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
