import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkData() {
    const client = await pool.connect();
    try {
        const tables = ['analytics', 'articles', 'audit_logs'];
        for (const table of tables) {
            const res = await client.query(`SELECT count(*) FROM "${table}";`);
            console.log(`Table ${table} has ${res.rows[0].count} rows.`);
        }
    } catch (err) {
        console.error("Error checking data:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkData();
