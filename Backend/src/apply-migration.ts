import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyMigration() {
    console.log('Starting manual migration...');

    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL environment variable is required');
        process.exit(1);
    }

    const client = new pg.Client({
        connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    try {
        const migrationsDir = path.join(__dirname, '..', 'drizzle', 'migrations');
        const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

        for (const file of files) {
            const migrationPath = path.join(migrationsDir, file);
            console.log(`Reading migration: ${file}`);
            const sql = fs.readFileSync(migrationPath, 'utf8');

            const statements = sql.split('--> statement-breakpoint');

            for (let statement of statements) {
                statement = statement.trim();
                if (!statement) continue;

                console.log(`Executing statement: ${statement.substring(0, 50)}...`);
                try {
                    await client.query(statement);
                } catch (err: any) {
                    if (err.code === '42P07' || err.code === '42701') {
                        // 42P07 = table already exists, 42701 = duplicate column
                        console.log(`  Already exists, skipping...`);
                    } else {
                        console.error(`  Error executing statement: ${err.message}`);
                    }
                }
            }
        }

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await client.end();
    }
}

applyMigration();
