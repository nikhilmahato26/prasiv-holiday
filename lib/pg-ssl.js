// Hosted Postgres (Supabase, Neon, RDS) requires TLS but presents a chain Node
// has no root for, so verification has to be off. A local server usually speaks
// no TLS at all, and asking for it there fails the connection outright — so
// decide from the connection string rather than hardcoding one or the other.
export function sslFor(connectionString) {
  if (!connectionString) return false
  let host, sslmode
  try {
    const u = new URL(connectionString)
    host = u.hostname
    sslmode = u.searchParams.get('sslmode')
  } catch {
    return { rejectUnauthorized: false }
  }
  if (sslmode === 'disable') return false
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return false
  return { rejectUnauthorized: false }
}
