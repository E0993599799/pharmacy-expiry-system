'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Branch } from '@/lib/types'
import { calculateRiskLevel } from '@/lib/utils/risk'

interface ImportRecord {
  branch_id: string
  product_name: string
  lot_number: string
  expiry_date: string
  quantity: number
  status: 'pending' | 'imported' | 'error'
  error?: string
}

export default function PDFUploadPage() {
  const [branch, setBranch] = useState('')
  const [branches, setBranches] = useState<Branch[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<ImportRecord[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: userBranches } = await supabase
      .from('user_branches')
      .select('branch_id')
      .eq('auth_user_id', session.user.id)

    let query = supabase.from('branches').select('*')
    if (userBranches && userBranches.length > 0) {
      const branchIds = userBranches.map((b) => b.branch_id)
      query = query.in('id', branchIds)
    }

    const { data: branchesData } = await query
    setBranches(branchesData || [])
    if (branchesData && branchesData.length > 0) {
      setBranch(branchesData[0].id)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setRecords([])
    } else {
      alert('กรุณาเลือกไฟล์ PDF')
    }
  }

  const parsePDF = async (file: File) => {
    try {
      // In production: Use PDF.js to extract text and tables
      // For now: Mock parsing
      const mockRecords: ImportRecord[] = [
        {
          branch_id: branch,
          product_name: 'ยา แอมโมซิลลิน 500mg',
          lot_number: 'LOT-2025-001',
          expiry_date: '2025-12-31',
          quantity: 50,
          status: 'pending',
        },
        {
          branch_id: branch,
          product_name: 'ยา พาราเซตามอล 500mg',
          lot_number: 'LOT-2025-002',
          expiry_date: '2025-11-30',
          quantity: 100,
          status: 'pending',
        },
        {
          branch_id: branch,
          product_name: 'ยา ไอบูโพรเฟน 200mg',
          lot_number: 'LOT-2025-003',
          expiry_date: '2025-10-15',
          quantity: 75,
          status: 'pending',
        },
      ]
      return mockRecords
    } catch (error) {
      console.error('PDF parsing error:', error)
      throw error
    }
  }

  const handleUpload = async () => {
    if (!file || !branch) {
      alert('กรุณาเลือกไฟล์และสาขา')
      return
    }

    try {
      setLoading(true)
      setUploadProgress(0)

      // Parse PDF
      const parsedRecords = await parsePDF(file)
      setRecords(parsedRecords)

      // Match products and prepare import
      const { data: products } = await supabase
        .from('products')
        .select('id, name')

      const enrichedRecords = parsedRecords.map((record) => {
        const matchedProduct = products?.find(
          (p) =>
            p.name.toLowerCase() === record.product_name.toLowerCase() ||
            p.name.includes(record.product_name.split(' ')[0])
        )

        return {
          ...record,
          product_id: matchedProduct?.id,
          status: matchedProduct ? ('pending' as const) : ('error' as const),
          error: matchedProduct ? undefined : 'ไม่พบรายการยา',
        }
      })

      setRecords(enrichedRecords)
      setUploadProgress(50)
    } catch (error) {
      console.error('Error:', error)
      alert('ไม่สามารถประมวลผล PDF ได้')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const recordsToInsert = records
        .filter((r) => r.status === 'pending' && !r.error)
        .map((r) => ({
          branch_id: branch,
          product_id: r.product_name, // Will be replaced with actual ID in production
          lot_number: r.lot_number,
          expiry_date: r.expiry_date,
          quantity: r.quantity,
          quantity_unit: 'box',
          notes: 'นำเข้าจากไฟล์ PDF',
          source_type: 'pdf',
          confirmation_status: 'unconfirmed',
          created_by: session.user.id,
        }))

      if (recordsToInsert.length === 0) {
        alert('ไม่มีระเบียนที่พร้อมสำหรับการนำเข้า')
        return
      }

      // Batch insert
      const { error } = await supabase
        .from('expiry_records')
        .insert(recordsToInsert)

      if (error) throw error

      setUploadProgress(100)
      alert(`นำเข้า ${recordsToInsert.length} รายการสำเร็จ`)
      setRecords([])
      setFile(null)
      setUploadProgress(0)
    } catch (error) {
      console.error('Import error:', error)
      alert('ไม่สามารถนำเข้าข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">นำเข้าจากไฟล์ PDF</h2>
        <a href="/dashboard/expiry-records" className="btn btn-secondary">
          ← กลับไป
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="card border-l-4 border-blue-500">
          <h3 className="text-lg font-bold mb-4">1. อัปโหลด PDF</h3>

          <div className="form-group">
            <label className="form-label">สาขา *</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="form-select"
              required
            >
              <option value="">เลือกสาขา</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">ไฟล์ PDF *</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="form-input"
              disabled={loading}
            />
          </div>

          {file && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                ✓ เลือก: <strong>{file.name}</strong>
              </p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || !branch || loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'กำลังประมวลผล...' : '▶ ประมวลผล PDF'}
          </button>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{uploadProgress}%</p>
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="card border-l-4 border-green-500">
          <h3 className="text-lg font-bold mb-4">2. ตรวจสอบข้อมูล</h3>

          {records.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <p>อัปโหลด PDF เพื่อดูตัวอย่างข้อมูล</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="table text-sm">
                  <thead>
                    <tr>
                      <th>ยา</th>
                      <th>เลขล็อต</th>
                      <th>วันหมดอายุ</th>
                      <th>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, idx) => (
                      <tr key={idx}>
                        <td className="text-xs">{record.product_name}</td>
                        <td className="text-xs">{record.lot_number}</td>
                        <td className="text-xs">
                          {new Date(record.expiry_date).toLocaleDateString(
                            'th-TH'
                          )}
                        </td>
                        <td>
                          {record.status === 'error' ? (
                            <span className="text-xs text-red-600">
                              ❌ {record.error}
                            </span>
                          ) : (
                            <span className="text-xs text-green-600">
                              ✓ พร้อม
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-800">
                  พบ {records.filter((r) => !r.error).length} รายการที่พร้อม
                </p>
              </div>

              <button
                onClick={handleImport}
                disabled={
                  loading ||
                  records.filter((r) => !r.error).length === 0
                }
                className="btn btn-primary w-full"
              >
                {loading ? 'กำลังนำเข้า...' : '✓ นำเข้าข้อมูล'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card mt-8 bg-blue-50 border-l-4 border-blue-500">
        <h3 className="font-bold mb-2">📋 รูปแบบ PDF ที่รองรับ</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>✓ ตารางรายการรับเข้าสินค้า</li>
          <li>✓ ใบปะหนาดยา (ที่มีวันหมดอายุ)</li>
          <li>✓ รายงานสินค้าคงคลัง</li>
          <li>ℹ️ ต้องมีคอลัมน์: ชื่อยา, เลขล็อต, วันหมดอายุ, จำนวน</li>
        </ul>
      </div>
    </div>
  )
}
