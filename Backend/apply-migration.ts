import { db } from "./src/db.js";
import { sql } from "drizzle-orm";

async function applyMigration() {
    console.log("Applying manual migration...");
    try {
        await db.execute(sql`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "locationText" varchar(255) DEFAULT 'Kathmandu, Nepal';`);
        await db.execute(sql`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "logoText" varchar(255) DEFAULT 'Portfolio.Dev';`);
        await db.execute(sql`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "heroHeadingLine1" varchar(255) DEFAULT 'Start building';`);
        await db.execute(sql`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "heroHeadingLine2" varchar(255) DEFAULT 'The Future';`);
        console.log("Migration applied successfully (or columns already exist).");
    } catch (err) {
        console.error("Migration failed:", err);
    }
    process.exit(0);
}

applyMigration();
