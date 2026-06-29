'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { DashboardStats } from '@/lib/types'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    expired: 0,
    expiring_30_days: 0,
    expiring_60_days: 0,
    expiring_90_days: 0,
    missing_expiry: 0,
    total_products: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]

        // Expired
        const { count: expiredCount } = await supabase
          .from('expiry_records')
          .select('*', { count: 'exact', head: true })
          .lt('expiry_date', today)

        // Expiring in 30 days
        const thirtyDaysAhead = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
        const { count: count30 } = await supabase
          .from('expiry_records')
          .select('*', { count: 'exact', head: true })
          .gte('expiry_date', today)
          .lte('expiry_date', thirtyDaysAhead)

        // Expiring in 60 days
        const sixtyDaysAhead = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
        const { count: count60 } = await supabase
          .from('expiry_records')
          .select('*', { count: 'exact', head: true })
          .gt('expiry_date', thirtyDaysAhead)
          .lte('expiry_date', sixtyDaysAhead)

        // Expiring in 90 days
        const ninetyDaysAhead = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
        const { count: count90 } = await supabase
          .from('expiry_records')
          .select('*', { count: 'exact', head: true })
          .gt('expiry_date', sixtyDaysAhead)
          .lte('expiry_date', ninetyDaysAhead)

        // Total products
        const { count: totalProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })

        setStats({
          expired: expiredCount || 0,
          expiring_30_days: count30 || 0,
          expiring_60_days: count60 || 0,
          expiring_90_days: count90 || 0,
          missing_expiry: 0, // TODO: implement missing expiry detection
          total_products: totalProducts || 0,
        })
      } catch (err) {
        setError('ไม่สามารถโหลดข้อมูลสถิติได้')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8 text-gray-900">แดชบอร์ด</h2>

      {error && (
        <div className="alert alert-danger mb-8">{error}</div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Expired - Red */}
        <div className="card bg-red-50 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">หมดอายุแล้ว</p>
              <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">ต้องถูกกำจัดหรือเปลี่ยนได้ทันที</p>
        </div>

        {/* Critical 30 days - Dark Red */}
        <div className="card bg-red-50 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">เร่งด่วน (≤30 วัน)</p>
              <p className="text-3xl font-bold text-orange-600">{stats.expiring_30_days}</p>
            </div>
            <div className="text-4xl">🔴</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">ต้องตรวจสอบและดำเนินการก่อน 30 วัน</p>
        </div>

        {/* High 60 days - Orange */}
        <div className="card bg-yellow-50 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">สูง (31-60 วัน)</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.expiring_60_days}</p>
            </div>
            <div className="text-4xl">🟡</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">ควรตรวจสอบในช่วง 2 เดือนข้างหน้า</p>
        </div>

        {/* Medium 90 days - Yellow */}
        <div className="card bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">ปกติ (61-90 วัน)</p>
              <p className="text-3xl font-bold text-blue-600">{stats.expiring_90_days}</p>
            </div>
            <div className="text-4xl">🔵</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">สถานะปกติ ตรวจสอบเป็นประจำ</p>
        </div>

        {/* Normal */}
        <div className="card bg-green-50 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">ปลอดภัย (>90 วัน)</p>
              <p className="text-3xl font-bold text-green-600">
                {Math.max(0, stats.total_products - stats.expired - stats.expiring_30_days - stats.expiring_60_days - stats.expiring_90_days)}
              </p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">ยาที่ปลอดภัยในระยะยาว</p>
        </div>

        {/* Total Products */}
        <div className="card bg-gray-50 border-l-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">ยาทั้งหมด</p>
              <p className="text-3xl font-bold text-gray-600">{stats.total_products}</p>
            </div>
            <div className="text-4xl">💊</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">จำนวนสินค้าทั้งหมดในฐานข้อมูล</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4 text-gray-900">การกระทำด่วน</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/dashboard/expiry-records" className="btn btn-primary w-full">
            ➕ บันทึกใหม่
          </a>
          <a href="/dashboard/products" className="btn btn-secondary w-full">
            ⚙️ จัดการยา
          </a>
          <a href="/dashboard/reports" className="btn btn-secondary w-full">
            📊 ดูรายงาน
          </a>
          <button className="btn btn-secondary w-full">
            🔄 รีเฟรช
          </button>
        </div>
      </div>
    </div>
  )
}
