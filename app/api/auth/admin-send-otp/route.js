import { getRedis } from '@/lib/redis'
import { getUserByUsername } from '@/lib/db'
import { getSettings } from '@/lib/db'
import { sendOtpEmail } from '@/lib/email'

function randomOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(request) {
  try {
    const { username } = await request.json()
    if (!username?.trim()) return Response.json({ error: 'Username is required' }, { status: 400 })

    const user = await getUserByUsername(username.trim())
    if (!user) return Response.json({ error: 'No admin account found with that username' }, { status: 404 })

    const settings = await getSettings()
    const recoveryEmail = settings.admin_recovery_email?.trim()
    if (!recoveryEmail) {
      return Response.json({ error: 'Recovery email not configured. Set it in Admin → Settings.' }, { status: 400 })
    }

    const otp = randomOtp()
    const key = `otp:admin:${username.toLowerCase().trim()}`
    await getRedis().set(key, otp, { ex: 600 })
    await sendOtpEmail(recoveryEmail, otp)

    // Return masked email so user knows where to look
    const masked = recoveryEmail.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(b.length) + c)
    return Response.json({ ok: true, maskedEmail: masked })
  } catch (err) {
    console.error('admin-send-otp error:', err)
    return Response.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
