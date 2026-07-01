'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!email) {
        setError('Email is required')
        return
      }

      // TODO: Implement via Supabase auth.resetPasswordForEmail
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
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
          <p className="text-muted">Reset your password</p>
        </div>

        {/* Card */}
        <div className="card">
          {sent ? (
            <>
              {/* Success State */}
              <div className="text-center space-y-4">
                <div className="text-5xl">📧</div>
                <h2 className="text-xl font-semibold text-text">Check your email</h2>
                <p className="text-muted">
                  We sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-muted text-sm">
                  Click the link in the email to create a new password. The link expires in 1 hour.
                </p>

                <div className="pt-4 space-y-2">
                  <button
                    onClick={() => setSent(false)}
                    className="btn btn-secondary w-full"
                  >
                    Try another email
                  </button>
                  <Link href="/auth/login" className="btn btn-primary w-full inline-block">
                    Back to login
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Form State */}
              <p className="text-muted text-sm mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {error && (
                <div className="alert alert-danger mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>

              {/* Footer Link */}
              <div className="mt-6 text-center text-sm">
                <Link href="/auth/login" className="text-ok hover:underline">
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
