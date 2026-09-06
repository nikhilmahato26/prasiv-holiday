import { hashPassword } from '@/lib/auth'
import { createUser, getUserByUsername } from '@/lib/db'

export async function POST(request) {
  const { username, password } = await request.json()

  if (!username || !password) {
    return Response.json({ error: 'Username and password are required' }, { status: 400 })
  }

  if (password.length < 8) {
    return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const existing = await getUserByUsername(username)
  if (existing) {
    return Response.json({ error: 'Username already taken' }, { status: 409 })
  }

  const hashed = await hashPassword(password)
  const user = await createUser(username, hashed)

  return Response.json({ ok: true, user: { id: user.id, username: user.username, role: user.role } }, { status: 201 })
}
