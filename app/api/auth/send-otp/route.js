import { getRedis } from '@/lib/redis'
import { sendOtpEmail } from '@/lib/email'

function randomOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(request) {
  try {
    const { email } = await request.json()
    if (!email?.trim()) return Response.json({ error: 'Email is required' }, { status: 400 })

    const otp = randomOtp()
    const key = `otp:agency:${email.toLowerCase().trim()}`

    try {
      await getRedis().set(key, otp, { ex: 600 })
    } catch (redisErr) {
      console.error('send-otp redis error:', redisErr)
      return Response.json({ error: 'OTP storage failed. Please try again.' }, { status: 500 })
    }

    try {
      await sendOtpEmail(email.trim(), otp)
    } catch (mailErr) {
      console.error('send-otp email error:', mailErr)
      return Response.json({ error: 'Failed to send OTP email. Please try again.' }, { status: 500 })
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('send-otp error:', err)
    return Response.json({ error: 'Failed to send OTP. Check your email address.' }, { status: 500 })
  }
}
