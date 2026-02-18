import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./db.js";

async function main() {
    console.log("Running migrations...");
    try {
        await migrate(db, { migrationsFolder: "drizzle/migrations" });
        console.log("Migrations applied successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
