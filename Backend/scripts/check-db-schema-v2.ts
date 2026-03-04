import { db } from "../src/db.js";
import { sql } from "drizzle-orm";

async function checkSchema() {
    console.log("--- Database Column Check (Articles) ---");
    try {
        const result = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = 'articles';
    `);

        if (result.rows && result.rows.length > 0) {
            result.rows.forEach((row: any) => {
                console.log(`Column: ${row.column_name}`);
            });
        } else {
            console.log("No columns found or table 'articles' does not exist.");
        }
    } catch (error: any) {
        console.error("Error:", error.message);
    } finally {
        process.exit(0);
    }
}

checkSchema();
