// ============================================================
// FILE: src/create-tables.ts
// ============================================================
import { connection } from "./db.js";

function logTables(message: string, level: "info" | "error" | "warn" = "info") {
  const timestamp = new Date().toISOString();
  const prefix = level === "error" ? "❌" : level === "warn" ? "⚠️" : "✅";
  console.log(`${prefix} [${timestamp}] [TABLES] ${message}`);
}

export async function createTables() {
  try {
    logTables("Starting table creation...");

    await connection.query(
      `CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        techStack JSON NOT NULL,
        imageUrl VARCHAR(500) NOT NULL,
        githubUrl VARCHAR(500),
        liveUrl VARCHAR(500),
        category VARCHAR(100) NOT NULL,
        displayOrder INT NOT NULL DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'Completed',
        problemStatement TEXT,
        motivation TEXT,
        systemDesign TEXT,
        challenges TEXT,
        learnings TEXT
      )`
    );

    await connection.query(
      `CREATE TABLE IF NOT EXISTS skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL,
        status VARCHAR(100) NOT NULL DEFAULT 'Core',
        icon VARCHAR(100) NOT NULL DEFAULT 'Code',
        description TEXT NOT NULL DEFAULT '',
        proof TEXT NOT NULL DEFAULT '',
        x FLOAT NOT NULL DEFAULT 50,
        y FLOAT NOT NULL DEFAULT 50
      )`
    );

    await connection.query(
      `CREATE TABLE IF NOT EXISTS skill_connections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        from_skill_id VARCHAR(100) NOT NULL,
        to_skill_id VARCHAR(100) NOT NULL
      )`
    );

    await connection.query(
      `CREATE TABLE IF NOT EXISTS experiences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role VARCHAR(200) NOT NULL,
        organization VARCHAR(200) NOT NULL,
        period VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(100) NOT NULL DEFAULT 'Experience'
      )`
    );

    await connection.query(
      `CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL DEFAULT '',
        message TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`
    );

    await connection.query(
      `CREATE TABLE IF NOT EXISTS mindset (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(100) NOT NULL DEFAULT 'Brain',
        tags JSON NOT NULL
      )`
    );

    await connection.query(
      `CREATE TABLE IF NOT EXISTS analytics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        targetId INT,
        path VARCHAR(500) NOT NULL,
        browser VARCHAR(100),
        os VARCHAR(100),
        device VARCHAR(50),
        country VARCHAR(100),
        city VARCHAR(100),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`
    );

    await connection.query(
      `CREATE TABLE IF NOT EXISTS email_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        body TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`
    );

    logTables("All tables created successfully!");

    const [rows] = await connection.query("SHOW TABLES");
    logTables(`📋 Verified tables: ${JSON.stringify(rows)}`);

    return true;
  } catch (error) {
    logTables(`Failed to create tables: ${error}`, "error");
    throw error;
  }
}
