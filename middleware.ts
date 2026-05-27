import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  // Let everything through - auth is handled client-side and in API routes
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
