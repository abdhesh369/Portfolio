
import { db } from "../src/db.js";
import { sql } from "drizzle-orm";
import fs from "fs";

async function main() {
    try {
        let output = "";
        output += "Checking tables...\n";
        const tables = await db.execute(sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        output += "Tables: " + JSON.stringify(tables.rows.map(r => r.table_name)) + "\n";

        output += "\nChecking columns for 'guestbook'...\n";
        const columns = await db.execute(sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'guestbook'
        `);
        output += "Columns in 'guestbook': " + JSON.stringify(columns.rows) + "\n";

        fs.writeFileSync("db-check-output.txt", output);
        process.exit(0);
    } catch (error: any) {
        fs.writeFileSync("db-check-output.txt", "Error: " + error.message);
        process.exit(1);
    }
}

main();
