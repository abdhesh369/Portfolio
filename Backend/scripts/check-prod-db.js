import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkPublicTables() {
    const client = await pool.connect();
    try {
        console.log("Listing all tables in 'public' schema...");
        const res = await client.query(`
            SELECT tablename 
            FROM pg_catalog.pg_tables 
            WHERE schemaname = 'public';
        `);
        console.table(res.rows);

        console.log("\nChecking migrations table content...");
        const migExists = await client.query(`SELECT to_regclass('public.__drizzle_migrations') as regclass;`);
        if (migExists.rows[0].regclass) {
            const migs = await client.query(`SELECT * FROM "__drizzle_migrations";`);
            console.table(migs.rows);
        } else {
            console.log("__drizzle_migrations table does not exist.");
        }

    } catch (err) {
        console.error("Error checking public tables:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkPublicTables();
