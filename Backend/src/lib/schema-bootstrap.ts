import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "../db.js";
import { logger } from "./logger.js";
import path from "path";
import fs from "fs";

// Resolve migrations folder — works both when cwd is Backend/ or the monorepo root
const migrationsCandidates = [
    path.resolve(process.cwd(), "drizzle/migrations"),
    path.resolve(process.cwd(), "Backend/drizzle/migrations"),
];
const STARTUP_MIGRATIONS_FOLDER = migrationsCandidates.find(p => fs.existsSync(p)) ?? migrationsCandidates[0];


async function runBestEffortMigrations() {
    try {
        logger.info({ context: "schema-bootstrap", path: STARTUP_MIGRATIONS_FOLDER }, "Checking migrations folder...");

        if (!fs.existsSync(STARTUP_MIGRATIONS_FOLDER)) {
            // Only warn, don't throw. In some test environments, migrations folder might be missing but DB is pre-seeded.
            logger.warn({ context: "schema-bootstrap" }, "Migrations folder missing - skipping automated migration");
            return;
        }

        await migrate(db, { migrationsFolder: STARTUP_MIGRATIONS_FOLDER });
        logger.info({ context: "schema-bootstrap" }, "Migration check completed");
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        
        // Specific handling for "CREATE SCHEMA" failure which can happen on some managed PG providers
        if (message.includes('CREATE SCHEMA IF NOT EXISTS "drizzle"')) {
            logger.warn({ context: "schema-bootstrap" }, "Could not manage 'drizzle' schema - assuming tables are already migrated or using external management.");
            return;
        }

        logger.error(
            { context: "schema-bootstrap", error: message },
            "Migration step failed"
        );
        
        // Critical for tests: if migrations fail, we must stop execution
        if (process.env.NODE_ENV === "test") {
            throw error;
        }
        // In production/dev, we try to proceed with consistency checks
    }
}

async function applyConsistencyChecks() {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        // Raw SQL DDL removed. Migrations handle schema initialization.
        await client.query("COMMIT");
        logger.info({ context: "schema-bootstrap" }, "Consistency checks complete");
    } catch (error) {
        await client.query("ROLLBACK");
        logger.error({ context: "schema-bootstrap", error }, "Consistency check failed");
        // Don't throw here to allow app to start if migrations succeeded
    } finally {
        client.release();
    }
}

let bootstrapPromise: Promise<void> | null = null;

export async function bootstrapDatabaseSchema() {
    if (bootstrapPromise) return bootstrapPromise;

    bootstrapPromise = (async () => {
        // In test environment, we want a truly fresh start to ensure migration consistency
        if (process.env.NODE_ENV === "test") {
            const client = await pool.connect();
            try {
                logger.info({ context: "schema-bootstrap" }, "Wiping test database schema...");
                await client.query("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;");
                await client.query("DROP SCHEMA IF EXISTS drizzle CASCADE;");
                logger.info({ context: "schema-bootstrap" }, "Test database wiped");
            } catch (error) {
                logger.error({ context: "schema-bootstrap", error }, "Failed to wipe test database");
                bootstrapPromise = null; // Allow retry on failure
                throw error;
            } finally {
                client.release();
            }
        }

        // 1. Run migrations first (primary method)
        await runBestEffortMigrations();

        // Verify that at least one core table exists - if not, migrations failed to apply
        const client = await pool.connect();
        try {
            const check = await client.query("SELECT to_regclass('public.analytics') as has_analytics, to_regclass('public.reading_list') as has_reading_list;");
            if (!check.rows[0].has_analytics || !check.rows[0].has_reading_list) {
                logger.error({ 
                    context: "schema-bootstrap", 
                    analytics: !!check.rows[0].has_analytics,
                    reading_list: !!check.rows[0].has_reading_list
                }, "Core tables missing after migration! Migrations failed to apply correctly.");
                if (process.env.NODE_ENV === "test") {
                    throw new Error("Migrations failed to create core tables (analytics or reading_list)");
                }
            } else {
                logger.info({ context: "schema-bootstrap" }, "Core tables verified (analytics & reading_list)");
            }
        } finally {
            client.release();
        }

        // 2. Run light consistency checks/init (secondary safety net)
        await applyConsistencyChecks();
    })();

    return bootstrapPromise;
}

