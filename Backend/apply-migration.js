
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('d:/Portfolio/Backend/.env') });

const { Client } = pg;

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        // Add availabilitySlots column if it doesn't exist
        await client.query(`
      ALTER TABLE "site_settings" 
      ADD COLUMN IF NOT EXISTS "availabilitySlots" jsonb DEFAULT '[]'::jsonb;
    `);
        console.log('Successfully added availabilitySlots column to site_settings.');

    } catch (err) {
        console.error('Error applying migration:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
