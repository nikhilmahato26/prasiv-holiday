import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import fs from 'fs';

neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

const envFile = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envFile.match(/DATABASE_URL="?([^"\n]+)"?/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1] : null;

const pool = new Pool({ connectionString: dbUrl });

async function run() {
  const { rows } = await pool.query('SELECT username FROM users');
  console.log('Users:', rows);
  pool.end();
}

run();
