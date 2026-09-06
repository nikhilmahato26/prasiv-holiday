import { getRedis } from '@/lib/redis'
import { hashPassword } from '@/lib/auth'
import { getAgencyByEmail, updateAgencyPassword } from '@/lib/db'

export async function POST(request) {
  try {
    const { email, otp, newPassword } = await request.json()
    if (!email?.trim() || !otp?.trim() || !newPassword?.trim()) {
      return Response.json({ error: 'Email, OTP and new password are required' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Verify OTP
    const key = `otp:agency:${email.toLowerCase().trim()}`
    const stored = await getRedis().get(key)
    if (!stored) return Response.json({ error: 'OTP expired or not found. Please request a new one.' }, { status: 400 })
    if (String(stored) !== String(otp).trim()) return Response.json({ error: 'Incorrect OTP. Please try again.' }, { status: 400 })

    // Check agency exists
    const agency = await getAgencyByEmail(email.toLowerCase().trim())
    if (!agency) return Response.json({ error: 'No agency found with this email.' }, { status: 404 })

    // Update password
    const hashed = await hashPassword(newPassword)
    await updateAgencyPassword(email, hashed)
    await getRedis().del(key)

    return Response.json({ ok: true })
  } catch (err) {
    console.error('agency-reset-password error:', err)
    return Response.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
