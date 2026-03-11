import { db } from "./src/db.js";
import { sql } from "drizzle-orm";

async function fixSettings() {
    console.log("Adding missing columns to site_settings table...");

    try {
        await db.execute(sql`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS "resumeUrl" varchar(500);`);
        console.log("✅ Added resumeUrl");

        await db.execute(sql`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS "whyHireMeData" jsonb;`);
        console.log("✅ Added whyHireMeData");

        // Verify
        const res = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'site_settings' ORDER BY ordinal_position;`);
        console.log("Final columns:", res.rows.map(r => r.column_name));
    } catch (err: any) {
        console.error("ERROR:", err.message);
    }

    process.exit(0);
}

fixSettings();
