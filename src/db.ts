import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../shared/schema.js';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
}

export const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

const logDb = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log('[' + timestamp + '] [db] ' + msg);
};

export async function checkDatabaseHealth(): Promise<{ healthy: boolean; message?: string }> {
    try {
        const client = await pool.connect();
        client.release();
        logDb('Successfully connected to PostgreSQL database');
        return { healthy: true };
    } catch (error) {
        logDb('Database connection error: ' + error);
        return { healthy: false, message: String(error) };
    }
}

process.on('SIGINT', async () => {
    logDb('Closing database pool...');
    await pool.end();
    process.exit(0);
});
