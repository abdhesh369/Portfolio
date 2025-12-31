
// ============================================================
// FILE: src/create-tables.ts
// ============================================================
import { sqlite as sqlite2 } from "./db.js";

function logTables(message: string, level: "info" | "error" | "warn" = "info") {
  const timestamp = new Date().toISOString();
  const prefix = level === "error" ? "❌" : level === "warn" ? "⚠️" : "✅";
  console.log(`${prefix} [${timestamp}] [TABLES] ${message}`);
}

export async function createTables() {
  try {
    logTables("Starting table creation...");

    sqlite2
      .prepare(
        `CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          techStack TEXT NOT NULL DEFAULT '[]',
          imageUrl TEXT NOT NULL,
          githubUrl TEXT,
          liveUrl TEXT,
          category TEXT NOT NULL,
          problemStatement TEXT,
          motivation TEXT,
          systemDesign TEXT,
          challenges TEXT,
          learnings TEXT
        )`
      )
      .run();

    sqlite2
      .prepare(
        `CREATE TABLE IF NOT EXISTS skills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          icon TEXT NOT NULL DEFAULT 'Code'
        )`
      )
      .run();

    sqlite2
      .prepare(
        `CREATE TABLE IF NOT EXISTS experiences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          role TEXT NOT NULL,
          organization TEXT NOT NULL,
          period TEXT NOT NULL,
          description TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'Experience'
        )`
      )
      .run();

    sqlite2
      .prepare(
        `CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          subject TEXT NOT NULL DEFAULT '',
          message TEXT NOT NULL,
          createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`
      )
      .run();

    logTables("All tables created successfully!");

    const tables = sqlite2
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as any[];

    const tableNames = tables.map((t) => t.name).join(", ");
    logTables(`📋 Verified ${tables.length} tables: ${tableNames}`);

    return true;
  } catch (error) {
    logTables(`Failed to create tables: ${error}`, "error");
    throw error;
  }
}