import { cookies } from 'next/headers'
import { signJWT, tokenCookieOptions, verifyPassword } from '@/lib/auth'
import { getUserByUsername } from '@/lib/db'

export async function POST(request) {
  const { username, password } = await request.json()

  if (!username || !password) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
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
