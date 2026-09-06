import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import fs from 'fs';
import { webcrypto } from 'crypto';

// Polyfill global crypto if needed
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

const envFile = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envFile.match(/DATABASE_URL="?([^"\n]+)"?/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1] : null;

const pool = new Pool({ connectionString: dbUrl });

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256
  );
  const toHex = (arr) => Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  return toHex(salt) + ':' + toHex(new Uint8Array(bits));
}

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        email      TEXT UNIQUE NOT NULL,
        password   TEXT NOT NULL,
        role       TEXT NOT NULL DEFAULT 'admin',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        username   TEXT UNIQUE
      )
    `);

    const hashed = await hashPassword('namaste123');
    await pool.query(
      'INSERT INTO users (email, username, password, role) VALUES ($1, $1, $2, $3) ON CONFLICT (email) DO UPDATE SET password = $2',
      ['admin', hashed, 'admin']
    );
    console.log('Admin user created successfully!');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

run();
