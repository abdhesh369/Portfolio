import { db } from "../src/db.js";
import { sql } from "drizzle-orm";

async function checkSchema() {
    console.log("--- Database Column Check ---");
    try {
        const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'articles';
    `);
        console.log("Columns in 'articles' table:");
        console.table(result.rows);
    } catch (error) {
        console.error("Failed to check schema:", error);
    } finally {
        process.exit(0);
    }
}

checkSchema();
