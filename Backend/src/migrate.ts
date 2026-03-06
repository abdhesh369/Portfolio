import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./db.js";
import { logger } from "./lib/logger.js";

async function main() {
    logger.info({ context: "migration" }, "Running migrations...");
    try {
        await migrate(db, { migrationsFolder: "drizzle/migrations" });
        logger.info({ context: "migration" }, "Migrations applied successfully!");
        process.exit(0);
    } catch (err: any) {
        logger.error({ context: "migration", error: err.message }, "Migration failed");
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
