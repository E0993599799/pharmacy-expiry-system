import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/auth/callback',
  '/',
]

export async function middleware(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const pathname = requestUrl.pathname

  // Allow public routes without session check
  if (PUBLIC_ROUTES.includes(pathname)) {
    // Redirect authenticated users away from auth pages
    if (pathname.startsWith('/auth/') && pathname !== '/auth/callback') {
      try {
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll() {
                return request.cookies.getAll()
              },
              setAll(cookiesToSet) {
                const response = NextResponse.next()
                cookiesToSet.forEach(({ name, value, options }) =>
                  response.cookies.set(name, value, options)
                )
                return response
              },
            },
          }
        )

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      } catch (error) {
        // Continue to auth page if session check fails
      }
    }

    return NextResponse.next()
  }

  // Protected routes - require authentication
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            const response = NextResponse.next()
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
            return response
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

export const config = {
  matcher: [
    // Protect all routes except:
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
