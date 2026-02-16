import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../shared/schema.js';

const poolConnection = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export const db = drizzle(poolConnection, { schema, mode: 'default' });

// Export connection for use by create-tables.ts
export const connection = poolConnection;

const logDb = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log('[' + timestamp + '] [db] ' + msg);
};

export async function checkDatabaseHealth(): Promise<{ healthy: boolean; message?: string }> {
    try {
        const connection = await poolConnection.getConnection();
        connection.release();
        logDb('Successfully connected to MySQL database');
        return { healthy: true };
    } catch (error) {
        logDb('Database connection error: ' + error);
        return { healthy: false, message: String(error) };
    }
}

process.on('SIGINT', async () => {
    logDb('Closing database pool...');
    await poolConnection.end();
    process.exit(0);
});
