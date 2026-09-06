import { NextResponse } from 'next/server'
import { verifyJWT, COOKIE_NAME } from '@/lib/auth'

// Requests that must still work while the site runs without a database:
// signing in and out, and the public enquiry form (which logs and emails
// rather than storing).
const STATIC_MODE_WRITABLE = ['/api/auth/', '/api/enquiries']

export async function proxy(request) {
  const { pathname } = request.nextUrl

  // ── Demo mode: refuse every write ───────────────────────────────────────────
  // With no DATABASE_URL there is nothing to write to, so a save would fail
  // somewhere deeper with a generic error. Refusing here gives the admin panel
  // one clear message instead, and guarantees the demo sign-in can never be
  // used to change anything. As soon as DATABASE_URL is set this is inert.
  if (pathname.startsWith('/api/') && !process.env.DATABASE_URL && request.method !== 'GET') {
    const allowed = STATIC_MODE_WRITABLE.some(p => pathname.startsWith(p))
    if (!allowed) {
      return NextResponse.json(
        { error: 'Demo mode — changes are not saved. Connect a database to enable editing.' },
        { status: 503 }
      )
    }
  }

  if (!pathname.startsWith('/admin/dashboard')) {
    return NextResponse.next()
  }

  // ── Admin dashboard: signed in or bounced to the login page ────────────────
  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  try {
    await verifyJWT(token)
    return NextResponse.next()
  } catch {
    const response = NextResponse.redirect(new URL('/admin', request.url))
    response.cookies.delete(COOKIE_NAME)
    return response
  }
}

export const config = {
  matcher: ['/admin/dashboard/:path*', '/api/:path*'],
}
