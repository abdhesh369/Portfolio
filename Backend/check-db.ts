import { db } from "./src/db.js";
import { sql } from "drizzle-orm";

async function checkSchema() {
    try {
        const { rows: auditCols } = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'audit_log'`);
        const { rows: clientCols } = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'clients'`);
        const a = auditCols.map(c => c.column_name).sort();
        const c = clientCols.map(c => c.column_name).sort();
        console.log("A_COLS:" + a.join("|"));
        console.log("C_COLS:" + c.join("|"));
    } catch (err) {
        console.error("FAIL:", err);
    } finally {
        process.exit(0);
    }
}

checkSchema();
