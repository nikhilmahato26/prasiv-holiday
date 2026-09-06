import { Pool } from '@neondatabase/serverless';
import fs from 'fs';
import ws from 'ws';

import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

// simple .env parser
const env = fs.readFileSync('.env', 'utf-8');
const dbUrlMatch = env.match(/DATABASE_URL="?([^"\n]+)"?/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1] : null;

const pool = new Pool({ connectionString: dbUrl });

async function exportPackages() {
  try {
    const { rows } = await pool.query('SELECT * FROM packages');
    fs.writeFileSync('./packages_export.json', JSON.stringify(rows, null, 2));
    console.log('Exported ' + rows.length + ' packages');
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

exportPackages();
