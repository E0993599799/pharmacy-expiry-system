'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUserEmail(session.user.email || '')
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Pharmacy Expiry Management
            </h1>
            <p className="text-sm text-gray-600">ระบบบริหารจัดการยาหมดอายุ</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{userEmail}</span>
            <button
              onClick={handleSignOut}
              className="btn btn-secondary"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white min-h-screen overflow-y-auto">
          <nav className="p-4 space-y-2">
            <Link href="/dashboard">
              <div className="px-4 py-2 rounded hover:bg-gray-800">
                📊 แดชบอร์ด
              </div>
            </Link>
            <Link href="/dashboard/products">
              <div className="px-4 py-2 rounded hover:bg-gray-800">
                💊 ยา
              </div>
            </Link>
            <Link href="/dashboard/expiry-records">
              <div className="px-4 py-2 rounded hover:bg-gray-800">
                📋 บันทึกอายุการใช้
              </div>
            </Link>

            {/* Phase 2 Features */}
            <div className="border-t border-gray-700 mt-4 pt-4">
              <p className="text-xs text-gray-400 px-4 mb-2">PHASE 2</p>
              <Link href="/dashboard/expiry-records/photo-entry">
                <div className="px-4 py-2 rounded hover:bg-gray-800 text-sm">
                  📷 บันทึกจากรูป
                </div>
              </Link>
              <Link href="/dashboard/expiry-records/pdf-upload">
                <div className="px-4 py-2 rounded hover:bg-gray-800 text-sm">
                  📄 นำเข้า PDF
                </div>
              </Link>
              <Link href="/dashboard/exports">
                <div className="px-4 py-2 rounded hover:bg-gray-800 text-sm">
                  📥 ส่งออก & แจ้ง
                </div>
              </Link>
            </div>

            <Link href="/dashboard/reports">
              <div className="px-4 py-2 rounded hover:bg-gray-800">
                📈 รายงาน
              </div>
            </Link>

            {/* Settings */}
            <div className="border-t border-gray-700 mt-4 pt-4">
              <Link href="/dashboard/settings/line-bot">
                <div className="px-4 py-2 rounded hover:bg-gray-800 text-sm">
                  🤖 LINE Bot
                </div>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
