import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '@portfolio/shared';
import { env } from './env.js';
import { logger } from './lib/logger.js';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
}
logger.info({ context: "database" }, `Connecting to database: ${process.env.DATABASE_URL.substring(0, 15)}...`);

// Configure Pool for Production
// Neon free-tier databases hibernate after ~5 min of inactivity.
// Cold starts take 3-7 s, so connectionTimeoutMillis must be generous.
export const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
    max: env.NODE_ENV === 'production' ? 20 : 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000, // 15 s — handles Neon cold starts (increased from 10s)
    query_timeout: 15000, // Per-query timeout
    ssl: env.NODE_ENV === 'production' || env.DATABASE_URL.includes("neon.tech") 
        ? { rejectUnauthorized: false } 
        : false,
});

export const db = drizzle(pool, { schema });

/**
 * Checks database connectivity
 */
export async function checkDatabaseHealth(): Promise<{ healthy: boolean; message: string }> {
    const timeout = new Promise<{ healthy: boolean; message: string }>((_, reject) =>
        setTimeout(() => reject(new Error('Database health check timed out')), 20000)
    );

    try {
        const check = async () => {
            const client = await pool.connect();
            try {
                await client.query('SELECT 1');
                return { healthy: true, message: 'Database connected successfully' };
            } finally {
                client.release();
            }
        };

        return await Promise.race([check(), timeout]) as { healthy: boolean; message: string };
    } catch (error: unknown) {
        return { healthy: false, message: error instanceof Error ? error.message : "Database health check failed" };
    }
}

/**
 * Gracefully closes the database pool
 */
export async function closePool() {
    logger.info({ context: "database" }, "Closing database pool...");
    await pool.end();
    logger.info({ context: "database" }, "Database pool closed");
}


