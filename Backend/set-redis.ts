/* eslint-disable no-console */
import { Redis } from "ioredis";
import "dotenv/config";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
    throw new Error("REDIS_URL environment variable is missing");
}
const connection = new Redis(redisUrl as string);

async function main() {
    try {
        console.log("Attempting to set maxmemory-policy to noeviction...");
        await connection.config("SET", "maxmemory-policy", "noeviction");
        console.log("✅ Successfully updated Redis eviction policy to 'noeviction'");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        console.error("❌ Failed to update Redis config via script:", e.message);
        console.log(" ");
        console.log("⚠️ NOTE: Redis Labs (Redis Cloud) usually restricts the 'CONFIG' command. You need to change the 'Default Eviction Policy' to 'noeviction' directly in your Redis Cloud dashboard settings.");
    } finally {
        connection.disconnect();
    }
}

main();
