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

async function cleanAndMigrate() {
    const client = await pool.connect();
    try {
        console.log("Fetching all tables in public schema...");
        const res = await client.query(`
            SELECT tablename 
            FROM pg_catalog.pg_tables 
            WHERE schemaname = 'public';
        `);

        for (const row of res.rows) {
            console.log(`Dropping table ${row.tablename}...`);
            await client.query(`DROP TABLE IF EXISTS "${row.tablename}" CASCADE;`);
        }

        console.log("✓ All tables dropped.");

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

cleanAndMigrate();
