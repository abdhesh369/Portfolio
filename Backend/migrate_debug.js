import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const url = "postgresql://postgres:4M8DeZWBZ5Gt1E11@db.tctzdrjxdzyzpvknwbco.supabase.co:5432/postgres";
const migrationPath = path.join(__dirname, 'drizzle', 'migrations', '0034_brainy_iron_lad.sql');

async function debug() {
    const client = new Client({ connectionString: url });
    try {
        await client.connect();
        console.log('Connected to DB');
        
        const sql = fs.readFileSync(migrationPath, 'utf8');
        const statements = sql.split('--> statement-breakpoint');
        
        console.log(`Found ${statements.length} statements`);
        
        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i].trim().replace(/;$/, '');
            if (!stmt) continue;
            
            try {
                console.log(`Executing statement ${i + 1}...`);
                await client.query(stmt);
            } catch (err) {
                console.error(`FAILED on statement ${i + 1}:`);
                console.error('SQL:', stmt);
                console.error('ERROR:', err.message);
                
                if (err.message.includes('check constraint')) {
                     // Diagnostic query
                     console.log('Running diagnostics...');
                }
                break;
            }
        }
    } catch (err) {
        console.error('Connection failed:', err.message);
    } finally {
        await client.end();
    }
}

debug();
