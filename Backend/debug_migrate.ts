import { db, pool } from "./src/db.js";
import fs from "fs";
import path from "path";

async function run() {
  const migrationsDir = "./drizzle/migrations";
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const migrationName = file.replace(".sql", "");
    if (migrationName < "0031") {
        console.log(`Skipping applied migration: ${file}`);
        continue;
    }

    console.log(`Executing migration ${file}...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    const statements = sql.split("--> statement-breakpoint");
    
    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i].trim();
        if (!stmt) continue;
        console.log(`  Statement ${i}...`);
        try {
            await db.execute(stmt);
        } catch (err: any) {
            console.error(`ERROR in ${file} at statement ${i}:`);
            console.error(stmt);
            console.error(err); // Full error object
            process.exit(1);
        }
    }
  }
}

run().then(() => pool.end()).catch(err => {
  console.error(err);
  process.exit(1);
});
