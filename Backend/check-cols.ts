import { db } from "./src/db.js";
import { sql } from "drizzle-orm";

async function checkColumns() {
    const res = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'site_settings';`);
    console.log(JSON.stringify(res.rows.map(r => r.column_name)));
    process.exit(0);
}

checkColumns();
