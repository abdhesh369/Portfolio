import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { logger } from './lib/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyMigration() {
    logger.info('Starting manual migration...');

    if (!process.env.DATABASE_URL) {
        logger.error('DATABASE_URL environment variable is required');
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
            logger.info({ file }, `Reading migration: ${file}`);
            const sql = fs.readFileSync(migrationPath, 'utf8');

            const statements = sql.split('--> statement-breakpoint');

            for (let statement of statements) {
                statement = statement.trim();
                if (!statement) continue;

                logger.info({ statement: statement.substring(0, 50) }, `Executing statement`);
                try {
                    await client.query(statement);
                } catch (err: unknown) {
                    const pgErr = err as { code?: string; message?: string };
                    if (pgErr.code === '42P07' || pgErr.code === '42701') {
                        // 42P07 = table already exists, 42701 = duplicate column
                        logger.info(`  Already exists, skipping...`);
                    } else {
                        logger.error({ err }, `  Error executing statement: ${pgErr.message || "Unknown error"}`);
                    }
                }
            }
        }

        logger.info('Migration completed successfully!');
    } catch (error) {
        logger.error({ err: error }, 'Migration failed');
    } finally {
        await client.end();
    }
}

applyMigration();
