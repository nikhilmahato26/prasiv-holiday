const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
let dbUrl = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('=')[1].trim();
    // remove quotes if any
    if (dbUrl.startsWith('"') && dbUrl.endsWith('"')) dbUrl = dbUrl.slice(1, -1);
  }
});

const { neonConfig } = require('@neondatabase/serverless');
neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

const pool = new Pool({ connectionString: dbUrl });

async function migrate() {
  try {
    await pool.query(`
      INSERT INTO destinations (name, color, image_url, description, emoji) VALUES
        ('Domestic', '#153e2d', 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=80', 'Explore the beauty within your borders', '🇮🇳'),
        ('International', '#7e5233', 'https://images.unsplash.com/photo-1585394365777-e81a5f5bf68a?w=800&q=80', 'Discover exotic destinations around the world', '✈️'),
        ('Spiritual', '#e8520a', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80', 'Find peace and serenity in sacred places', '🕉️')
      ON CONFLICT DO NOTHING
    `);
    
    const oldDestinations = ['Munnar', 'Alleppey', 'Wayanad'];
    const { rows: packages } = await pool.query('SELECT id, data FROM packages');
    let updatedCount = 0;
    for (const pkg of packages) {
      if (pkg.data && oldDestinations.includes(pkg.data.destination)) {
        pkg.data.destination = 'Domestic';
        await pool.query('UPDATE packages SET data = $1 WHERE id = $2', [JSON.stringify(pkg.data), pkg.id]);
        updatedCount++;
      }
    }
    
    for (const name of oldDestinations) {
      await pool.query('DELETE FROM destinations WHERE name = $1', [name]);
    }
    
    console.log(`Migrated ${updatedCount} packages and removed old destinations.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
