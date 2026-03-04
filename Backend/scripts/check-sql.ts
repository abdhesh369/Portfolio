import { db } from "../src/db.js";
import { articlesTable } from "../shared/schema.js";

async function checkSQL() {
    console.log("--- Drizzle SQL Check ---");
    try {
        const query = db.select().from(articlesTable);
        const sql = query.toSQL();
        console.log("SQL Query:");
        console.log(sql.sql);
        console.log("Params:", sql.params);
    } catch (error: any) {
        console.error("Error:", error.message);
    } finally {
        process.exit(0);
    }
}

checkSQL();
