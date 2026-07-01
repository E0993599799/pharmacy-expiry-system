import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/auth/callback',
  '/',
]

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow public routes and API routes
  if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Check for Supabase auth cookie
  const authCookie = request.cookies.get('sb-auth-token')

  // Redirect to login if no session
  if (!authCookie) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Protect all routes except public ones
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}
