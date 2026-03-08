import { existsSync, readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, "..", "drizzle", "migrations");
const metaDir = path.join(migrationsDir, "meta");

console.log("🔍 Validating migrations...");

if (!existsSync(migrationsDir)) {
    console.error("❌ Migrations directory not found");
    process.exit(1);
}

const sqlFiles = readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort();
console.log(`Found ${sqlFiles.length} SQL migration files.`);

if (!existsSync(metaDir)) {
    console.warn("⚠️ Meta directory not found. Snapshots might be missing.");
} else {
    const snapshots = readdirSync(metaDir).filter(f => f.endsWith("_snapshot.json"));
    console.log(`Found ${snapshots.length} snapshot files.`);

    if (snapshots.length < sqlFiles.length) {
        console.warn(`⚠️ Warning: Found ${sqlFiles.length} SQL files but only ${snapshots.length} snapshots.`);
    }
}

console.log("✅ Migration validation check complete (basic).");
