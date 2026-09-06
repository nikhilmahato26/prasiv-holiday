import { getRedis } from '@/lib/redis'

export async function POST(request) {
  try {
    const { email, otp } = await request.json()
    if (!email?.trim() || !otp?.trim()) return Response.json({ error: 'Email and OTP are required' }, { status: 400 })

    const key = `otp:agency:${email.toLowerCase().trim()}`
    const stored = await getRedis().get(key)

    if (!stored) return Response.json({ error: 'OTP expired or not found. Please request a new one.' }, { status: 400 })
    if (String(stored) !== String(otp).trim()) return Response.json({ error: 'Incorrect OTP. Please try again.' }, { status: 400 })

    await getRedis().del(key)
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Failed to verify OTP' }, { status: 500 })
  }
}
