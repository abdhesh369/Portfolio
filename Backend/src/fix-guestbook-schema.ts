
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

async function fixSchema() {
    const client = new pg.Client({
        connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
    try {
        console.log('Adding reactions column to guestbook table...');
        await client.query(`
            ALTER TABLE "guestbook" ADD COLUMN IF NOT EXISTS "reactions" jsonb DEFAULT '{}'::jsonb;
        `);
        console.log('Success!');

        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'guestbook';
        `);
        console.log('Updated Guestbook Columns:' + JSON.stringify(res.rows));
    } catch (err) {
        console.error('Error fixing schema:', err);
    } finally {
        await client.end();
    }
}

fixSchema();
