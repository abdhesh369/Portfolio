import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log("Adding missing column 'featuredImageAlt' to table 'articles'...");
        await client.query(`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS "featuredImageAlt" text;
    `);
        console.log("Column added successfully or already exists.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.end();
    }
}

migrate();
