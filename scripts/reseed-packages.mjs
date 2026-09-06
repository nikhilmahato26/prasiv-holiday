// One-off: wipe admin-owned packages and re-seed from lib/packages-data.js
// (the set the public site historically displayed). Agency-submitted packages
// (agency_id IS NOT NULL) are preserved. Also busts the Redis packages cache.
//
//   node scripts/reseed-packages.mjs
//
import fs from 'fs'

// Minimal .env loader (matches init.mjs) so this runs without extra deps.
const env = fs.readFileSync(new URL('../.env', import.meta.url), 'utf8')
for (const line of env.split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
}

const db = await import('../lib/db.js')

console.log('Re-seeding packages from lib/packages-data.js ...')
const seeded = await db.resetPackages()
console.log(`Inserted ${seeded.length} packages.`)

try {
  const { invalidatePackagesCache } = await import('../lib/redis.js')
  await invalidatePackagesCache()
  console.log('Redis packages cache cleared.')
} catch (err) {
  console.warn('Could not clear Redis cache (safe to ignore, 60s TTL):', err.message)
}

process.exit(0)
