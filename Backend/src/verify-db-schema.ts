
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

async function verifySchema() {
    const client = new pg.Client({
        connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
    try {
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'guestbook';
        `);
        console.log('GUESTBOOK_COLUMNS:' + JSON.stringify(res.rows));
        
        const settingsRes = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'site_settings';
        `);
        console.log('SITE_SETTINGS_COLUMNS:' + JSON.stringify(settingsRes.rows));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

verifySchema();
