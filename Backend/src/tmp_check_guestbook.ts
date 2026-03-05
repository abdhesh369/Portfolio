import pg from 'pg';
const { Pool } = pg;

const connectionString = "postgresql://neondb_owner:npg_DxSXsPlB3zc8@ep-floral-frost-a1zk9v1f-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({
    connectionString,
});

async function check() {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT EXISTS (
               SELECT FROM information_schema.tables 
               WHERE  table_schema = 'public'
               AND    table_name   = 'guestbook'
            );
        `);
        console.log("Guestbook table exists:", res.rows[0].exists);
    } catch (error) {
        console.error("Check failed:", error);
    } finally {
        client.release();
        await pool.end();
    }
}

check();
