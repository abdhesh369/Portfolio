import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
async function dropTables() {
    const client = await pool.connect();
    try {
        const tables = ['analytics', 'articles', 'audit_logs', 'article_tags', 'email_templates', 'experiences', 'messages', 'mindset', 'projects', 'seo_settings', 'services', 'skill_connections', 'skills', 'testimonials'];
        for (const table of tables) {
            console.log(`Dropping ${table}...`);
            await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
        }
        console.log("✓ Done.");
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}
dropTables();
