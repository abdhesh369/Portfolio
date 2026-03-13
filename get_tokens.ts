import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './packages/shared/src/schema.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './Backend/.env' });

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool, { schema });

async function getTokens() {
    try {
        const clients = await db.select().from(schema.clientsTable);
        console.log('--- ACTIVE CLIENT TOKENS ---');
        clients.forEach(c => {
            console.log(`Client: ${c.name} (${c.email})`);
            console.log(`Token: ${c.token}`);
            console.log(`Status: ${c.status}`);
            console.log('---------------------------');
        });
    } catch (err) {
        console.error('Error fetching tokens:', err);
    } finally {
        await pool.end();
    }
}

getTokens();
