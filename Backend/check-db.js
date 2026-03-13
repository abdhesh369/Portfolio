import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const { Client } = pg;

async function checkColumns() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('ERROR: DATABASE_URL not found in .env');
    process.exit(1);
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'projects' ORDER BY ordinal_position");
    res.rows.forEach(r => console.log(r.column_name));
  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    await client.end();
  }
}

checkColumns();
