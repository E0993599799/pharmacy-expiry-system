'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Branch } from '@/lib/types'

export default function ExportsPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState('')
  const [loading, setLoading] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')
  const [notificationSending, setNotificationSending] = useState(false)

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: userBranches } = await supabase
      .from('user_branches')
      .select('branch_id, role')
      .eq('auth_user_id', session.user.id)

    let query = supabase.from('branches').select('*')
    if (userBranches && userBranches.length > 0) {
      const role = userBranches[0].role
      if (role === 'branch_user') {
        const branchIds = userBranches.map((b) => b.branch_id)
        query = query.in('id', branchIds)
      }
    }

    const { data: branchesData } = await query
    setBranches(branchesData || [])
  }

  const handleExport = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedBranch) {
        params.append('branch_id', selectedBranch)
      }

      const response = await fetch(`/api/export/csv?${params.toString()}`)
      const csv = await response.text()

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `expiry-records-${new Date().toISOString().split('T')[0]}.csv`
      )
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Export error:', error)
      alert('ไม่สามารถส่งออกข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const handleSendNotification = async (riskLevel: string) => {
    try {
      setNotificationSending(true)
      const response = await fetch('/api/notifications/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: selectedBranch || null,
          riskLevel,
        }),
      })

      const result = await response.json()
      if (response.ok) {
        alert(`✓ ${result.message}`)
      } else {
        alert('ไม่สามารถส่งการแจ้งเตือนได้')
      }
    } catch (error) {
      console.error('Notification error:', error)
      alert('เกิดข้อผิดพลาดในการส่งการแจ้งเตือน')
    } finally {
      setNotificationSending(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8 text-gray-900">ส่งออก & การแจ้งเตือน</h2>

      {/* Export Section */}
      <div className="card mb-8 border-l-4 border-blue-500">
        <h3 className="text-lg font-bold mb-4">📥 ส่งออกข้อมูล</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="form-group">
            <label className="form-label">สาขา</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="form-select"
            >
              <option value="">ทั้งหมด</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">รูปแบบ</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
              className="form-select"
            >
              <option value="csv">CSV (Excel)</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? 'กำลังส่งออก...' : '⬇️ ดาวน์โหลดเป็น CSV'}
        </button>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          <p className="text-blue-900">
            ✓ ส่งออกรายการยาทั้งหมด พร้อมวันหมดอายุ ความเสี่ยง และรายละเอียดสาขา
          </p>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="card border-l-4 border-green-500">
        <h3 className="text-lg font-bold mb-4">📧 ส่งการแจ้งเตือนทางอีเมล</h3>

        <div className="form-group mb-4">
          <label className="form-label">สาขา</label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="form-select"
          >
            <option value="">ส่งไปยังผู้ดูแลระบบทั้งหมด</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleSendNotification('expired')}
            disabled={notificationSending}
            className="btn bg-red-600 hover:bg-red-700 text-white"
          >
            🚨 ส่งแจ้งหมดอายุ
          </button>

          <button
            onClick={() => handleSendNotification('critical')}
            disabled={notificationSending}
            className="btn bg-orange-600 hover:bg-orange-700 text-white"
          >
            ⚠️ ส่งแจ้งเร่งด่วน
          </button>

          <button
            onClick={() => handleSendNotification('high')}
            disabled={notificationSending}
            className="btn bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            🟡 ส่งแจ้งสูง
          </button>
        </div>

        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm">
          <p className="text-green-900">
            ✓ ส่งอีเมลไปยังผู้ดูแลระบบพร้อมรายการรายละเอียด
          </p>
        </div>
      </div>

      {/* Setup Info */}
      <div className="card mt-8 bg-gray-50">
        <h3 className="text-lg font-bold mb-4">⚙️ ตั้งค่า Email</h3>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <p className="font-bold text-yellow-900 mb-2">ℹ️ เพื่อใช้งาน Email</p>
          <p className="text-sm text-yellow-800 mb-3">
            เพิ่มตัวแปรสภาพแวดล้อมต่อไปนี้:
          </p>
          <div className="space-y-1 text-xs font-mono bg-white p-3 rounded border border-yellow-300">
            <p>EMAIL_USER=your-email@gmail.com</p>
            <p>EMAIL_PASSWORD=your-app-password</p>
          </div>
          <p className="text-xs text-yellow-800 mt-2">
            หมายเหตุ: ใช้ Gmail App Password, ไม่ใช่รหัสผ่านจริง
          </p>
        </div>
      </div>

      {/* Scheduled Reports */}
      <div className="card mt-8 border-l-4 border-purple-500">
        <h3 className="text-lg font-bold mb-4">⏰ รายงานตามตั้งเวลา</h3>

        <div className="space-y-3">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded">
            <p className="font-bold text-purple-900">ทุกวันศุกร์ 9:00 น.</p>
            <p className="text-sm text-purple-800 mt-1">
              ส่งอีเมลสรุปยาหมดอายุทั้งสัปดาห์
            </p>
            <button className="btn btn-secondary text-sm mt-2">
              ตั้งค่า
            </button>
          </div>

          <div className="p-3 bg-purple-50 border border-purple-200 rounded">
            <p className="font-bold text-purple-900">ทุกวันจันทร์ 8:00 น.</p>
            <p className="text-sm text-purple-800 mt-1">
              ส่งรายงานสัปดาห์ของทั้งสินค้าคงคลังและอายุการใช้
            </p>
            <button className="btn btn-secondary text-sm mt-2">
              ตั้งค่า
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
