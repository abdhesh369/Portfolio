import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './packages/shared/src/schema.js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

dotenv.config({ path: './Backend/.env' });

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool, { schema });

async function createTestClient() {
    try {
        const rawToken = crypto.randomUUID();
        const salt = await bcrypt.genSalt(10);
        const hashedToken = await bcrypt.hash(rawToken, salt);

        const [inserted] = await db.insert(schema.clientsTable).values({
            name: 'Test Client',
            email: 'test@example.com',
            token: hashedToken,
            status: 'active'
        }).returning();

        if (inserted) {
            console.log('--- NEW CLIENT CREATED ---');
            console.log(`Client ID: ${inserted.id}`);
            console.log(`Token (use this): ${rawToken}`);
            console.log('--------------------------');

            // Add a dummy project
            await db.insert(schema.clientProjectsTable).values({
                clientId: inserted.id,
                title: 'Portfolio Development',
                status: 'in_progress',
                notes: 'Welcome to your portal!'
            });
            console.log('Demo project added.');
        }
    } catch (err) {
        console.error('Error creating client:', err);
    } finally {
        await pool.end();
    }
}

createTestClient();
