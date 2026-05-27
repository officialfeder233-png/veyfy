import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './lib/auth'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public routes
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // All other routes need auth
  const token = req.cookies.get('veyfy_token')?.value
  if (!token || !verifyToken(token)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
