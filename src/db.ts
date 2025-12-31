
// ============================================================
// FILE: src/db.ts
// ============================================================
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import fs from "fs";
import * as schema from "../shared/schema.js";

function logDb(message: string, level: "info" | "error" | "warn" = "info") {
  const timestamp = new Date().toISOString();
  const prefix = level === "error" ? "❌" : level === "warn" ? "⚠️" : "✓";
  console.log(`${prefix} [${timestamp}] [DB] ${message}`);
}

let dataDir: string;

if (process.env.NODE_ENV === "production" || process.env.RENDER === "true") {
  dataDir = "/tmp/portfolio-db";
  console.log(`[DB_INIT] PRODUCTION MODE - Using /tmp`);
} else {
  dataDir = path.resolve(process.cwd(), "data");
  console.log(`[DB_INIT] DEVELOPMENT MODE - Using ./data`);
}

console.log(`[DB_INIT] Final dataDir: ${dataDir}`);

try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    logDb(`Created data directory: ${dataDir}`);
  }
} catch (error) {
  logDb(`Failed to create data directory: ${error}`, "error");
  throw error;
}

const dbFile = path.resolve(dataDir, "database.sqlite");
logDb(`Database file path: ${dbFile}`);

let sqliteDb: InstanceType<typeof Database>;
try {
  sqliteDb = new Database(dbFile, {
    verbose: process.env.NODE_ENV !== "production" ? console.log : undefined,
  });
  logDb(`Database ${fs.existsSync(dbFile) ? "opened" : "created"} successfully`);
} catch (error) {
  logDb(`Failed to initialize database: ${error}`, "error");
  throw error;
}

try {
  sqliteDb.pragma("journal_mode = WAL");
  sqliteDb.pragma("synchronous = NORMAL");
  sqliteDb.pragma("cache_size = -64000");
  sqliteDb.pragma("temp_store = MEMORY");
  sqliteDb.pragma("mmap_size = 30000000000");
  sqliteDb.pragma("foreign_keys = ON");
  logDb("SQLite pragmas configured successfully");
} catch (error) {
  logDb(`Failed to configure SQLite pragmas: ${error}`, "error");
  throw error;
}

export const db = drizzle(sqliteDb, { schema });
export const sqlite: any = sqliteDb;
export { schema };

export function checkDatabaseHealth(): {
  healthy: boolean;
  message: string;
  details?: any;
} {
  try {
    const result = sqliteDb.prepare("SELECT 1 as health").get();
    if (result && (result as any).health === 1) {
      return {
        healthy: true,
        message: "Database is healthy",
        details: {
          path: dbFile,
          size: fs.statSync(dbFile).size,
          mode: sqliteDb.pragma("journal_mode"),
        },
      };
    }
    return {
      healthy: false,
      message: "Database query returned unexpected result",
    };
  } catch (error) {
    return {
      healthy: false,
      message: `Database health check failed: ${error}`,
      details: { error },
    };
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  try {
    sqliteDb.pragma("wal_checkpoint(TRUNCATE)");
    sqliteDb.close();
    logDb("Database connection closed successfully");
  } catch (error) {
    logDb(`Error closing database connection: ${error}`, "error");
    throw error;
  }
}

export function createBackup(backupPath?: string): string {
  try {
    const backupDir = backupPath || path.resolve(dataDir, "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(backupDir, `backup-${timestamp}.sqlite`);
    sqliteDb.pragma("wal_checkpoint(TRUNCATE)");
    sqliteDb.prepare(`VACUUM INTO ?`).run(backupFile);
    logDb(`Database backup created: ${backupFile}`);
    return backupFile;
  } catch (error) {
    logDb(`Failed to create database backup: ${error}`, "error");
    throw error;
  }
}

export function cleanOldBackups(keepCount: number = 5): void {
  try {
    const backupDir = path.resolve(dataDir, "backups");
    if (!fs.existsSync(backupDir)) {
      return;
    }
    const backups = fs
      .readdirSync(backupDir)
      .filter((file) => file.endsWith(".sqlite"))
      .map((file) => ({
        name: file,
        path: path.join(backupDir, file),
        time: fs.statSync(path.join(backupDir, file)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);
    backups.slice(keepCount).forEach((backup) => {
      fs.unlinkSync(backup.path);
      logDb(`Deleted old backup: ${backup.name}`);
    });
  } catch (error) {
    logDb(`Failed to clean old backups: ${error}`, "error");
  }
}

process.on("beforeExit", () => {
  closeDatabaseConnection().catch((error) => {
    logDb(`Error during cleanup: ${error}`, "error");
  });
});
