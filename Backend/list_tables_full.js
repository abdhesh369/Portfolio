import pg from 'pg';
import "dotenv/config";
const { Client } = pg;

const url = process.env.DATABASE_URL;

if (!url) {
    console.warn("ERROR: DATABASE_URL environment variable is not set.");
    process.exit(1);
}

async function listAll() {
    const client = new Client({ connectionString: url });
    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
            ORDER BY table_name
        `);
        console.log('Tables found:');
        res.rows.forEach(r => console.log(`- ${r.table_schema}.${r.table_name}`));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

listAll();
