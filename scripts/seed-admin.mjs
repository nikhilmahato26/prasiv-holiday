import { readFileSync } from 'fs'
import pg from 'pg'
import { sslFor } from '../lib/pg-ssl.js'

const { Pool } = pg

// Load .env manually
const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k?.trim() && !k.startsWith('#')) process.env[k.trim()] = v.join('=').trim()
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: sslFor(process.env.DATABASE_URL) })

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256
  )
  const toHex = (arr) => Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
  return toHex(salt) + ':' + toHex(new Uint8Array(bits))
}

async function run() {
  // 1. Ensure users table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      email      TEXT UNIQUE NOT NULL,
      password   TEXT NOT NULL,
      role       TEXT NOT NULL DEFAULT 'admin',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  // 2. Add username column if missing
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE`)

  // 3. Backfill username from email for any existing rows
  await pool.query(`UPDATE users SET username = split_part(email, '@', 1) WHERE username IS NULL`)

  // 4. Register the admin named in .env. Re-running resets the password, which
  //    is how you recover a locked-out admin.
  const username = process.env.ADMIN_USERNAME?.trim()
  const password = process.env.ADMIN_PASSWORD?.trim()
  if (!username || !password) {
    console.error('✗ ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env')
    process.exit(1)
  }

  const hashed = await hashPassword(password)
  const { rows: check } = await pool.query('SELECT id FROM users WHERE username = $1', [username])
  if (check.length > 0) {
    await pool.query('UPDATE users SET password = $1, role = $2 WHERE username = $3', [hashed, 'admin', username])
    console.log(`✓ Password reset for existing admin "${username}"`)
  } else {
    await pool.query(
      `INSERT INTO users (email, username, password, role) VALUES ($1, $1, $2, 'admin')`,
      [username, hashed]
    )
    console.log(`✅ Admin "${username}" created`)
  }

  // 5. Show final state
  const { rows: final } = await pool.query('SELECT id, email, username, role FROM users ORDER BY id')
  console.log('\nAll users:')
  final.forEach(u => console.log(`  id=${u.id}  username=${u.username}  email=${u.email}  role=${u.role}`))

  await pool.end()
}

run().catch(err => { console.error(err); process.exit(1) })
