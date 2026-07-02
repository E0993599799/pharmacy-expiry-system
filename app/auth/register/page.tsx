'use client'

import GoogleSignIn from '@/app/components/GoogleSignIn'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const validateForm = () => {
    if (!email) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format'
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (password !== confirmPassword) return 'Passwords do not match'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      setSuccess(true)

      // Auto-login and redirect
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
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
          <p className="text-muted">Create your account</p>
        </div>

        {/* Card */}
        <div className="card">
          {/* Success Message */}
          {success && (
            <div className="alert alert-success mb-4">
              ✅ Account created! Redirecting to dashboard...
            </div>
          )}

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
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <p className="text-muted text-xs mt-1">Minimum 8 characters</p>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
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
          <div className="mt-6 text-center text-sm">
            <p className="text-muted">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-ok hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
