-- Drop the existing site_settings table (which has key/value columns causing 500 errors)
DROP TABLE IF EXISTS "site_settings";

-- Re-create with the schema defined in shared/schema.ts
CREATE TABLE IF NOT EXISTS "site_settings" (

	"id" serial PRIMARY KEY NOT NULL,
	"isOpenToWork" boolean DEFAULT true NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
