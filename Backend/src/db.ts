import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../shared/schema.js';
import { env } from './env.js';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
}

// Configure Pool for Production
// Neon free-tier databases hibernate after ~5 min of inactivity.
// Cold starts take 3-7 s, so connectionTimeoutMillis must be generous.
export const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
    max: env.NODE_ENV === 'production' ? 20 : 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // 10 s — handles Neon cold starts
});

export const db = drizzle(pool, { schema });

/**
 * Checks database connectivity
 */
export async function checkDatabaseHealth(): Promise<{ healthy: boolean; message: string }> {
    try {
        const client = await pool.connect();
        try {
            await client.query('SELECT 1');
            return { healthy: true, message: 'Database connected successfully' };
        } finally {
            client.release();
        }
    } catch (error: any) {
        return { healthy: false, message: error.message };
    }
}

/**
 * Gracefully closes the database pool
 */
export async function closePool() {
    console.log("📍 Closing database pool...");
    await pool.end();
    console.log("✓ Database pool closed");
}

process.on('SIGINT', async () => {
    await closePool();
    process.exit(0);
});
