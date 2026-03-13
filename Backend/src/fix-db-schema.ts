import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    const client = await pool.connect();
    try {
        console.log("Checking columns for 'articles' table...");
        
        // Add missing columns to articles
        const columns = [
            { name: 'viewCount', type: 'INTEGER DEFAULT 0 NOT NULL' },
            { name: 'readTimeMinutes', type: 'INTEGER DEFAULT 0 NOT NULL' },
            { name: 'featuredImageAlt', type: 'TEXT' },
            { name: 'reactions', type: 'JSONB DEFAULT \'{}\'::jsonb NOT NULL' },
        ];

        for (const col of columns) {
            try {
                await client.query(`ALTER TABLE "articles" ADD COLUMN "${col.name}" ${col.type}`);
                console.log(`Added column ${col.name} to articles`);
            } catch (err: any) {
                if (err.code === '42701') {
                    console.log(`Column ${col.name} already exists in articles`);
                } else {
                    console.error(`Error adding ${col.name} to articles:`, err.message);
                }
            }
        }

        // Fix projects lowercase columns if needed
        console.log("Checking columns for 'projects' table...");
        try {
            await client.query(`ALTER TABLE "projects" RENAME COLUMN "isFlagship" TO "isflagship"`);
            console.log("Renamed isFlagship to isflagship in projects");
        } catch (err: any) {
             console.log("isFlagship rename failed (already renamed or doesn't exist):", err.message);
        }

    } finally {
        client.release();
        await pool.end();
    }
}

run().catch(console.error);
