import pg from 'pg';
import "dotenv/config";
const { Client } = pg;

const url = process.env.DATABASE_URL;

if (!url) {
    console.error("ERROR: DATABASE_URL environment variable is not set.");
    process.exit(1);
}

async function checkSchema() {
    const client = new Client({ connectionString: url });
    try {
        await client.connect();
        
        // Check for singleton_guard column
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'site_settings'
        `);
        
        console.log('Columns in site_settings:');
        res.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));

        // Check for row count
        const countRes = await client.query('SELECT count(*) FROM site_settings');
        console.log(`\nRow count: ${countRes.rows[0].count}`);

        if (countRes.rows.length > 0) {
            const firstRow = await client.query('SELECT * FROM site_settings LIMIT 1');
            console.log('First row keys:', Object.keys(firstRow.rows[0]).join(', '));
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

checkSchema();
