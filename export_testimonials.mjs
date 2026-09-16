import pg from 'pg';
import { sslFor } from './lib/pg-ssl.js';
import fs from 'fs';

const { Pool } = pg;

// simple .env parser
const env = fs.readFileSync('.env', 'utf-8');
const dbUrlMatch = env.match(/DATABASE_URL="?([^"\n]+)"?/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1] : null;

const pool = new Pool({ connectionString: dbUrl, ssl: sslFor(dbUrl) });

async function exportTestimonials() {
  try {
    const { rows } = await pool.query('SELECT * FROM testimonials ORDER BY created_at DESC');
    const exportsString = `export const ALL_TESTIMONIALS = ${JSON.stringify(rows, null, 2)};\n`;
    fs.writeFileSync('./lib/testimonials-data.js', exportsString);
    console.log('Exported ' + rows.length + ' testimonials to lib/testimonials-data.js');
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

exportTestimonials();
