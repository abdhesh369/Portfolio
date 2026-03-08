import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.production' });

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function nukeAndMigrate() {
    const client = await pool.connect();
    try {
        console.log("Nuking public schema...");
        await client.query("DROP SCHEMA public CASCADE;");
        await client.query("CREATE SCHEMA public;");
        await client.query("GRANT ALL ON SCHEMA public TO public;");
        await client.query("COMMENT ON SCHEMA public IS 'standard public schema';");
        console.log("✓ Schema nuked successfully.");

        console.log("Running migrations...");
        const db = drizzle(pool);
        const migrationsFolder = path.resolve(process.cwd(), "drizzle/migrations");
        await migrate(db, { migrationsFolder });
        console.log("✓ Migrations completed successfully!");

    } catch (err) {
        console.error("❌ Operation failed:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

nukeAndMigrate();
