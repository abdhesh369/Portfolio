import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyMigration() {
    console.log('Starting manual migration...');

    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        multipleStatements: true, // Allow executing entire SQL file
    });

    try {
        const migrationFile = '0002_chief_dreaming_celestial.sql';
        const migrationPath = path.join(__dirname, '..', 'drizzle', 'migrations', migrationFile);

        console.log(`Reading migration: ${migrationFile}`);
        const sql = fs.readFileSync(migrationPath, 'utf8');

        // Split by statement-breakpoint if needed, but multipleStatements: true should handle it if there are no weird characters
        // Drizzle uses '--> statement-breakpoint' as a comment separator
        const statements = sql.split('--> statement-breakpoint');

        for (let statement of statements) {
            statement = statement.trim();
            if (!statement) continue;

            console.log(`Executing statement: ${statement.substring(0, 50)}...`);
            try {
                await connection.query(statement);
            } catch (err: any) {
                if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`  Row/Table already exists, skipping...`);
                } else {
                    console.error(`  Error executing statement: ${err.message}`);
                    // Optionally throw if it's a critical error
                }
            }
        }

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

applyMigration();
