import { getRedis } from '@/lib/redis'
import { hashPassword } from '@/lib/auth'
import { getUserByUsername, updateAdminPassword } from '@/lib/db'

export async function POST(request) {
  try {
    const { username, otp, newPassword } = await request.json()
    if (!username?.trim() || !otp?.trim() || !newPassword?.trim()) {
      return Response.json({ error: 'Username, OTP and new password are required' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const key = `otp:admin:${username.toLowerCase().trim()}`
    const stored = await getRedis().get(key)
    if (!stored) return Response.json({ error: 'OTP expired or not found. Please request a new one.' }, { status: 400 })
    if (String(stored) !== String(otp).trim()) return Response.json({ error: 'Incorrect OTP. Please try again.' }, { status: 400 })

    const user = await getUserByUsername(username.trim())
    if (!user) return Response.json({ error: 'Admin account not found.' }, { status: 404 })

    const hashed = await hashPassword(newPassword)
    await updateAdminPassword(username.trim(), hashed)
    await getRedis().del(key)

    return Response.json({ ok: true })
  } catch (err) {
    console.error('admin-reset-password error:', err)
    return Response.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
