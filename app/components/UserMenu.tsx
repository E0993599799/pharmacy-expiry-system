'use client'

import { signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface UserMenuProps {
  email?: string
}

export default function UserMenu({ email }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="relative">
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ok to-warning flex items-center justify-center text-white text-sm font-bold">
          {email?.[0]?.toUpperCase() || 'U'}
        </div>
        <span className="text-sm text-muted hidden sm:inline">{email || 'User'}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-panel rounded-lg border border-border shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-border">
            <p className="text-xs text-muted">Signed in as</p>
            <p className="text-sm text-text font-semibold truncate">{email || 'User'}</p>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left text-sm text-critical hover:bg-white/5 transition-colors flex items-center gap-2"
          >
            <span>🚪</span>
            <span>Sign out</span>
          </button>
        </div>
      )}

      {/* Close menu when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
