import pg from 'pg';
import { sslFor } from './lib/pg-ssl.js';
import fs from 'fs';

const { Pool } = pg;

// simple .env parser
const env = fs.readFileSync('.env', 'utf-8');
const dbUrlMatch = env.match(/DATABASE_URL="?([^"\n]+)"?/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1] : null;

const pool = new Pool({ connectionString: dbUrl, ssl: sslFor(dbUrl) });

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
