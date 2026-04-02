import pg from 'pg';
import "dotenv/config";
const { Client } = pg;

const url = process.env.DATABASE_URL;

if (!url) {
    console.error("ERROR: DATABASE_URL environment variable is not set.");
    process.exit(1);
}

async function check() {
    const client = new Client({ connectionString: url });
    try {
        await client.connect();
        const res = await client.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'');
        console.log('Tables found:', res.rows.map(r => r.table_name).join(', '));
        
        // Check site_settings specifically
        const settings = await client.query('SELECT * FROM site_settings LIMIT 1');
        console.log('Site Settings keys:', Object.keys(settings.rows[0] || {}).join(', '));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

check();
