'use client'

import GoogleSignIn from '@/app/components/GoogleSignIn'
import Link from 'next/link'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Email/password login placeholder
      // TODO: Implement via Supabase auth.signInWithPassword
      setError('Email/password login coming soon. Use Gmail for now.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text mb-2">Pharmacy Manager</h1>
          <p className="text-muted">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="card">
          {/* Error Message */}
          {error && (
            <div className="alert alert-danger mb-4">
              {error}
            </div>
          )}

          {/* Email/Password Form (Placeholder) */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-muted text-sm">Or</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Google OAuth */}
          <GoogleSignIn />

          {/* Footer Links */}
          <div className="mt-6 space-y-2 text-center text-sm">
            <p className="text-muted">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-ok hover:underline">
                Sign up
              </Link>
            </p>
            <p className="text-muted">
              <Link href="/auth/reset-password" className="text-ok hover:underline">
                Forgot password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
