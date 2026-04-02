import pg from 'pg';
const { Client } = pg;

const url = "postgresql://postgres:4M8DeZWBZ5Gt1E11@db.tctzdrjxdzyzpvknwbco.supabase.co:5432/postgres";

async function checkSchema() {
    const client = new Client({ connectionString: url });
    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'site_settings'
        `);
        console.log('Columns in site_settings:');
        res.rows.forEach(r => console.log(`- ${r.column_name} (${r.data_type})`));
        
        const res2 = await client.query("SELECT * FROM \"site_settings\" LIMIT 1");
        console.log('Row count:', (await client.query("SELECT count(*) FROM \"site_settings\"")).rows[0].count);
        console.log('First row keys:', Object.keys(res2.rows[0] || {}).join(', '));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

checkSchema();
