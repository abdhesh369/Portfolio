import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Validates that the current schema matches the migrations in the drizzle folder.
 * If drizzle-kit generate produces any output (new files), it means migrations are out of sync.
 */
function validateMigrations() {
    console.log('🔍 Checking database migrations...');

    try {
        // Run drizzle-kit generate and capture output
        // Note: Using --name check to avoid prompting if interactive
        const output = execSync('npx drizzle-kit generate --name ci_check', { encoding: 'utf8' });

        // Find if any new .sql files were created in the migrations folder
        const migrationDir = path.resolve('drizzle');
        const files = fs.readdirSync(migrationDir);
        const newMigrations = files.filter(f => f.includes('ci_check'));

        if (newMigrations.length > 0) {
            console.error('❌ Schema mismatch detected! Found pending changes not captured in migrations.');
            console.error('Please run "npm run generate" and commit the new migration files.');

            // Clean up the dummy migrations created for checking
            newMigrations.forEach(f => fs.unlinkSync(path.join(migrationDir, f)));
            process.exit(1);
        }

        console.log('✅ Migrations are up to date.');
    } catch (error) {
        console.error('❌ Failed to validate migrations:', error.message);
        process.exit(1);
    }
}

validateMigrations();
