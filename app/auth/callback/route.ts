import { createClient } from '@/lib/auth-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url))
  }

  try {
    const supabase = createClient()

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code
    )

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)
      return NextResponse.redirect(
        new URL(`/login?error=auth_failed`, request.url)
      )
    }

    // Redirect to dashboard after successful auth
    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (error) {
    console.error('Unexpected auth error:', error)
    return NextResponse.redirect(
      new URL('/login?error=auth_exception', request.url)
    )
  }
}
