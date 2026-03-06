import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { PoolClient } from "pg";
import { db, pool } from "../db.js";
import { logger } from "./logger.js";

const STARTUP_MIGRATIONS_FOLDER = "drizzle/migrations";

function parseBoolean(value: unknown): boolean | null {
    if (typeof value === "boolean") return value;
    if (typeof value !== "string") return null;

    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "n", "off"].includes(normalized)) return false;
    return null;
}

async function runBestEffortMigrations() {
    try {
        await migrate(db, { migrationsFolder: STARTUP_MIGRATIONS_FOLDER });
        logger.info({ context: "schema-bootstrap" }, "✓ Migration check completed");
    } catch (error) {
        logger.warn(
            { context: "schema-bootstrap", error },
            "Migration step failed. Continuing with compatibility patching"
        );
    }
}

async function ensureProjectsCompatibility(client: PoolClient) {
    await client.query(
        `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "isHidden" boolean DEFAULT false NOT NULL;`
    );
    await client.query(
        `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "imageAlt" text;`
    );
    await client.query(
        `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "viewCount" integer DEFAULT 0 NOT NULL;`
    );
}

async function ensureMessagesCompatibility(client: PoolClient) {
    await client.query(
        `ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "projectType" varchar(100);`
    );
    await client.query(
        `ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "budget" varchar(100);`
    );
    await client.query(
        `ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "timeline" varchar(100);`
    );
}

async function ensureTestimonialsCompatibility(client: PoolClient) {
    await client.query(
        `ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "linkedinUrl" varchar(500);`
    );
}

async function ensureExperiencesCompatibility(client: PoolClient) {
    await client.query(
        `ALTER TABLE "experiences" ADD COLUMN IF NOT EXISTS "startDate" timestamp DEFAULT now();`
    );
    await client.query(
        `ALTER TABLE "experiences" ADD COLUMN IF NOT EXISTS "endDate" timestamp;`
    );
    await client.query(`UPDATE "experiences" SET "startDate" = now() WHERE "startDate" IS NULL;`);
    await client.query(`ALTER TABLE "experiences" ALTER COLUMN "startDate" SET DEFAULT now();`);
    await client.query(`ALTER TABLE "experiences" ALTER COLUMN "startDate" SET NOT NULL;`);
}

async function ensureSiteSettingsCompatibility(client: PoolClient) {
    const tableExists = await client.query<{ regclass: string | null }>(
        `SELECT to_regclass('public.site_settings') AS regclass;`
    );

    if (!tableExists.rows[0]?.regclass) {
        await client.query(`
      CREATE TABLE "site_settings" (
        "id" serial PRIMARY KEY NOT NULL,
        "isOpenToWork" boolean DEFAULT true NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL
      );
    `);
        return;
    }

    const columnsResult = await client.query<{ column_name: string }>(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_settings';
  `);

    const columns = new Set(columnsResult.rows.map((row) => row.column_name));
    const isLegacyKeyValue = columns.has("key") && columns.has("value") && !columns.has("id");

    if (isLegacyKeyValue) {
        const legacyValueResult = await client.query<{ value: string }>(`
      SELECT value
      FROM "site_settings"
      WHERE key IN ('isOpenToWork', 'is_open_to_work', 'openToWork')
      ORDER BY "updatedAt" DESC
      LIMIT 1;
    `);

        const parsedLegacyValue = parseBoolean(legacyValueResult.rows[0]?.value);

        await client.query(`DROP TABLE "site_settings";`);
        await client.query(`
      CREATE TABLE "site_settings" (
        "id" serial PRIMARY KEY NOT NULL,
        "isOpenToWork" boolean DEFAULT true NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL
      );
    `);

        if (parsedLegacyValue !== null) {
            await client.query(
                `INSERT INTO "site_settings" ("isOpenToWork") VALUES ($1);`,
                [parsedLegacyValue]
            );
        }

        logger.warn(
            { context: "schema-bootstrap" },
            "Legacy site_settings schema detected and replaced"
        );
        return;
    }

    await client.query(
        `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "isOpenToWork" boolean DEFAULT true NOT NULL;`
    );
    await client.query(
        `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp DEFAULT now() NOT NULL;`
    );
}

async function applyCompatibilityPatches() {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        await ensureProjectsCompatibility(client);
        await ensureMessagesCompatibility(client);
        await ensureTestimonialsCompatibility(client);
        await ensureExperiencesCompatibility(client);
        await ensureSiteSettingsCompatibility(client);

        await client.query("COMMIT");
        logger.info({ context: "schema-bootstrap" }, "✓ Compatibility patching complete");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function bootstrapDatabaseSchema() {
    await runBestEffortMigrations();
    await applyCompatibilityPatches();
}
