import { cookies } from 'next/headers'
import { signJWT, tokenCookieOptions, verifyPassword } from '@/lib/auth'
import { getUserByUsername } from '@/lib/db'
import { isStaticMode, DEMO_ADMIN } from '@/lib/static-data'

export async function POST(request) {
  const { username, password } = await request.json()

  if (!username || !password) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // No database to authenticate against: accept the demo login so the panel can
  // be shown. Every write is refused while in this mode, and there is no stored
  // data behind it — the dashboard renders the same seed data as the public site.
  if (isStaticMode()) {
    if (username !== DEMO_ADMIN.username || password !== DEMO_ADMIN.password) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    const token = await signJWT({ username: DEMO_ADMIN.username, role: 'admin', demo: true })
    const cookieStore = await cookies()
    const opts = tokenCookieOptions(token)
    cookieStore.set(opts.name, opts.value, opts)
    return Response.json({ ok: true, demo: true })
  }

  const user = await getUserByUsername(username)
  if (!user) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const valid = await verifyPassword(password, user.password)
  if (!valid) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await signJWT({ username: user.username, role: user.role })
  const cookieStore = await cookies()
  const opts = tokenCookieOptions(token)
  cookieStore.set(opts.name, opts.value, opts)

  return Response.json({ ok: true })
}
