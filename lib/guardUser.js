import { cookies } from 'next/headers'
import { verifyJWT, COOKIE_NAME, AGENCY_COOKIE_NAME } from '@/lib/auth'

// Passes for any authenticated admin OR agency session.
export async function guardUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value || cookieStore.get(AGENCY_COOKIE_NAME)?.value
  if (!token) return false
  try {
    await verifyJWT(token)
    return true
  } catch {
    return false
  }
}
