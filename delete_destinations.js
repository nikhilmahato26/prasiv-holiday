require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    const result = await sql`DELETE FROM destinations WHERE name IN ('Domestic', 'International', 'Spiritual') RETURNING *`;
    console.log('Deleted default destinations:', result);
  } catch (err) {
    console.error('Error deleting destinations:', err);
  }
}

main();
