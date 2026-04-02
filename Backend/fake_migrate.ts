import { pool } from "./src/db.js";
import fs from "fs";

async function run() {
  // 1. Create migration schema/table
  await pool.query('CREATE SCHEMA IF NOT EXISTS "drizzle"');
  await pool.query(`CREATE TABLE IF NOT EXISTS "drizzle"."migrations" (
    "id" serial PRIMARY KEY,
    "hash" text NOT NULL,
    "created_at" bigint,
    "name" text UNIQUE
  )`);

  const migrationsDir = "./drizzle/migrations";
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const migrationName = file.replace(".sql", "");
    if (migrationName < "0031") {
      console.log(`Fake-applying migration: ${migrationName}`);
      try {
        await pool.query('INSERT INTO "drizzle"."migrations" (name, hash, created_at) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING', [migrationName, "fake_hash", Date.now()]);
      } catch (err) {
        console.error(`Failed to insert ${migrationName}:`, err);
      }
    }
  }
}

run().then(() => pool.end()).catch(console.error);
