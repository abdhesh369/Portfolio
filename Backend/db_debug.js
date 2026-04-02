import pg from 'pg';
const { Client } = pg;

const url = "postgresql://postgres:4M8DeZWBZ5Gt1E11@db.tctzdrjxdzyzpvknwbco.supabase.co:5432/postgres";

async function checkDb() {
    const client = new Client({ connectionString: url });
    try {
        await client.connect();
        console.log('Connected');
        
        const res = await client.query(`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
            ORDER BY table_schema, table_name
        `);
        console.log('Tables:');
        res.rows.forEach(r => console.log(`- ${r.table_schema}.${r.table_name}`));
        
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

checkDb();
