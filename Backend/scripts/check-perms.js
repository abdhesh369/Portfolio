import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
async function check() {
    const client = await pool.connect();
    try {
        console.log("Current User:", (await client.query("SELECT current_user")).rows[0].current_user);
        console.log("Schemas:");
        const res = await client.query("SELECT schema_name FROM information_schema.schemata;");
        console.table(res.rows);

        console.log("Public Schema Permissions:");
        const perm = await client.query("SELECT has_schema_privilege(current_user, 'public', 'CREATE, USAGE');");
        console.table(perm.rows);
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}
check();
