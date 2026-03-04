import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function checkSchema() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();

        console.log("--- Schema Check (article_tags) ---");
        const tagsRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'article_tags'
    `);
        tagsRes.rows.forEach(row => console.log(`Tag Column: ${row.column_name}`));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkSchema();
