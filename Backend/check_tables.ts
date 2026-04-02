import { db } from "./src/db.js";

async function run() {
  const res = await db.execute("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
  console.log(JSON.stringify(res.rows, null, 2));
}

run().catch(console.error);
