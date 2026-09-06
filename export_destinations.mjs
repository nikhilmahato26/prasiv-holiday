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

async function exportDestinations() {
  try {
    const { rows } = await pool.query('SELECT * FROM destinations ORDER BY created_at ASC');
    const exportsString = `export const ALL_DESTINATIONS = ${JSON.stringify(rows, null, 2)};\n`;
    fs.writeFileSync('./lib/destinations-data.js', exportsString);
    console.log('Exported ' + rows.length + ' destinations to lib/destinations-data.js');
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

exportDestinations();
