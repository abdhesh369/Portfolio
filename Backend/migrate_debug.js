import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import "dotenv/config";

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.env.DATABASE_URL;

if (!url) {
    console.error("ERROR: DATABASE_URL environment variable is not set.");
    process.exit(1);
}

async function runSQL() {
    const filePath = path.join(__dirname, 'drizzle', 'migrations', '0034_brainy_iron_lad.sql');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Split by statement-breakpoint
    const statements = content.split('--> statement-breakpoint');
    
    const client = new Client({ connectionString: url });
    try {
        await client.connect();
        console.log('Connected to DB');
        console.log(`Found ${statements.length} statements`);

        for (let i = 0; i < statements.length; i++) {
            const sql = statements[i].trim();
            if (!sql) continue;
            
            console.log(`Executing statement ${i + 1}...`);
            await client.query(sql);
        }
        
        console.log('\nMigration script finished successfully!');
    } catch (err) {
        console.error('\nFAIL at statement:', err.message);
        if (err.detail) console.error('Detail:', err.detail);
        if (err.hint) console.error('Hint:', err.hint);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runSQL();
