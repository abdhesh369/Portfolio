import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: '.env.production' });

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool);

async function runMigrations() {
    const migrationsFolder = path.resolve(process.cwd(), "drizzle/migrations");
    console.log(`Running migrations from: ${migrationsFolder}`);

    if (!fs.existsSync(migrationsFolder)) {
        console.error(`Folder not found: ${migrationsFolder}`);
        process.exit(1);
    }

    try {
        await migrate(db, { migrationsFolder });
        console.log("✓ Migrations completed successfully!");
    } catch (err) {
        console.error("❌ Migration failed:", err);
    } finally {
        await pool.end();
    }
}

runMigrations();
