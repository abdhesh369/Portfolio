import { sqlite } from "./db";

export async function createTables() {
  console.log("Creating database tables...");

  try {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS projects (
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
      );

      CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        icon TEXT NOT NULL DEFAULT 'Code'
      );

      CREATE TABLE IF NOT EXISTS experiences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        organization TEXT NOT NULL,
        period TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'Experience'
      );

      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL DEFAULT '',
        message TEXT NOT NULL,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ All tables created successfully!");

    const tables = sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all();

    console.log("📋 Tables in database:", tables.map((t: any) => t.name).join(", "));
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    throw error; // bubble up to index.ts
  }
}