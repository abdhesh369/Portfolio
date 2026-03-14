import { db } from "./src/db.js";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function runMigrate() {
    try {
        const sqlContent = fs.readFileSync(path.join(process.cwd(), "drizzle/migrations/0027_manual_clients_token_hash.sql"), "utf-8");
        const statements = sqlContent.split("--> statement-breakpoint").map(s => s.trim()).filter(s => s.length > 0);
        for (const stmt of statements) {
            console.log("Executing:", stmt);
            await db.execute(sql.raw(stmt));
        }
        console.log("Migration complete!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit(0);
    }
}
runMigrate();
