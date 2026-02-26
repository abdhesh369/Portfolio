import "dotenv/config";
import { checkDatabaseHealth } from "./db.js";

async function main() {
    console.log("Checking database health...");
    const result = await checkDatabaseHealth();
    console.log("Health check result:", result);
    process.exit(0);
}

main();
