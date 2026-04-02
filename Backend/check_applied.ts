import { db } from "./src/db.js";

async function run() {
  try {
    const res = await db.execute("SELECT name FROM drizzle.migrations ORDER BY created_at DESC");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err: any) {
    if (err.message.includes('relation "drizzle.migrations" does not exist')) {
        console.log("[]");
    } else {
        console.error(err);
    }
  }
}

run().catch(console.error);
