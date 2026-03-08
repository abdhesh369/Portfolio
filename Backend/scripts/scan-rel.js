import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
async function scanRel() {
    const client = await pool.connect();
    try {
        console.log("Relations Scan:");
        const res = await client.query(`
            SELECT n.nspname as schema, c.relname as name, c.relkind as kind
            FROM pg_catalog.pg_class c
            LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
            AND c.relkind IN ('r', 'v', 'm', 'S', 'f')
            ORDER BY schema, kind, name;
        `);
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}
scanRel();
