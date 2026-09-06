import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import fs from 'fs';
import path from 'path';

neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

const envFile = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envFile.match(/DATABASE_URL="?([^"\n]+)"?/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1] : undefined;

const pool = new Pool({ connectionString: dbUrl });

// We need to import SEED_PACKAGES, but since it's just an exported array in a file,
// we can import it dynamically (or import from './lib/packages.js')
import { SEED_PACKAGES } from './lib/packages.js';

async function run() {
  try {
    console.log('Resetting packages...');
    await pool.query('DELETE FROM packages');
    
    for (const pkg of SEED_PACKAGES) {
      await pool.query(
        `INSERT INTO packages (id, data, category, status, featured) VALUES ($1, $2, $3, 'approved', true)`,
        [pkg.id, JSON.stringify(pkg), pkg.category || 'group']
      );
      console.log('Inserted package:', pkg.title);
    }
    
    console.log('Updating Destinations images...');
    await pool.query(
      "UPDATE destinations SET image_url=$1 WHERE name='Domestic'",
      ['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80']
    );
    await pool.query(
      "UPDATE destinations SET image_url=$1 WHERE name='International'",
      ['https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80']
    );
    await pool.query(
      "UPDATE destinations SET image_url=$1 WHERE name='Spiritual'",
      ['https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80']
    );

    console.log('Done!');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

run();
