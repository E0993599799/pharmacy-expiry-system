'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Product, Branch } from '@/lib/types'
import { calculateRiskLevel, getRiskColor, getRiskLabel } from '@/lib/utils/risk'

export default function PhotoEntryPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [useCamera, setUseCamera] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [ocrText, setOcrText] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    branch_id: '',
    product_id: '',
    lot_number: '',
    expiry_date: '',
    quantity: '',
    quantity_unit: 'box',
    notes: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .order('name')
    setProducts(productsData || [])

    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { data: userBranches } = await supabase
        .from('user_branches')
        .select('branch_id')
        .eq('auth_user_id', session.user.id)

      let branchQuery = supabase.from('branches').select('*')
      if (userBranches && userBranches.length > 0) {
        const branchIds = userBranches.map((b) => b.branch_id)
        branchQuery = branchQuery.in('id', branchIds)
      }

      const { data: branchesData } = await branchQuery
      setBranches(branchesData || [])
      if (branchesData && branchesData.length > 0) {
        setFormData((prev) => ({ ...prev, branch_id: branchesData[0].id }))
      }
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (err) {
      alert('ไม่สามารถเข้าถึงกล้องได้')
      console.error(err)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      setCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)
        const photoData = canvasRef.current.toDataURL('image/jpeg')
        setPhoto(photoData)
        performOCR(photoData)
        stopCamera()
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const photoData = event.target?.result as string
        setPhoto(photoData)
        performOCR(photoData)
      }
      reader.readAsDataURL(file)
    }
  }

  const performOCR = async (imageData: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      })

      const result = await response.json()
      if (result.text) {
        setOcrText(result.text)
        parseOCRText(result.text)
      }
    } catch (err) {
      console.error('OCR error:', err)
      setOcrText('ไม่สามารถจดจำข้อความจากรูปภาพได้')
    } finally {
      setLoading(false)
    }
  }

  const parseOCRText = (text: string) => {
    const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/
    const dateMatch = text.match(dateRegex)

    const lotRegex = /LOT[:\s]+([A-Z0-9\-]+)/i
    const lotMatch = text.match(lotRegex)

    if (dateMatch) {
      setFormData((prev) => ({
        ...prev,
        expiry_date: parseDateString(dateMatch[1]),
      }))
    }

    if (lotMatch) {
      setFormData((prev) => ({
        ...prev,
        lot_number: lotMatch[1],
      }))
    }
  }

  const parseDateString = (dateStr: string): string => {
    const parts = dateStr.split(/[\/\-]/)
    if (parts.length === 3) {
      let day = parts[0].padStart(2, '0')
      let month = parts[1].padStart(2, '0')
      let year = parts[2]

      if (year.length === 2) {
        year = '20' + year
      }

      return `${year}-${month}-${day}`
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const recordToInsert = {
        ...formData,
        risk_level: calculateRiskLevel(formData.expiry_date),
        created_by: session.user.id,
        confirmation_status: 'unconfirmed',
        source_type: 'photo',
        photo_url: photo,
        ocr_raw_text: ocrText,
      }

      const { error } = await supabase
        .from('expiry_records')
        .insert([recordToInsert])

      if (error) throw error

      alert('บันทึกข้อมูลสำเร็จ (ต้องยืนยันก่อนใช้)')
      setPhoto(null)
      setOcrText('')
      setFormData({
        branch_id: formData.branch_id,
        product_id: '',
        lot_number: '',
        expiry_date: '',
        quantity: '',
        quantity_unit: 'box',
        notes: '',
      })
    } catch (err) {
      console.error('Error:', err)
      alert('ไม่สามารถบันทึกข้อมูลได้')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">บันทึกจากรูปภาพ</h2>
        <a href="/dashboard/expiry-records" className="btn btn-secondary">
          ← กลับไปบันทึกด้วยมือ
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Camera/Upload Section */}
        <div className="card border-l-4 border-blue-500">
          <h3 className="text-lg font-bold mb-4">ถ่ายรูปป้ายยา</h3>

          {!photo ? (
            <div className="space-y-4">
              {!cameraActive ? (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setUseCamera(true)
                      startCamera()
                    }}
                    className="btn btn-primary w-full"
                  >
                    📷 เปิดกล้อง
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary w-full"
                  >
                    📁 อัปโหลดรูปภาพ
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full bg-black rounded"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={capturePhoto}
                      className="btn btn-primary flex-1"
                    >
                      ✓ ถ่ายภาพ
                    </button>
                    <button
                      onClick={stopCamera}
                      className="btn btn-secondary flex-1"
                    >
                      ✕ ยกเลิก
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <img src={photo} alt="ภาพที่ถ่าย" className="w-full rounded" />
              <div className="flex gap-2">
                <button
                  onClick={() => setPhoto(null)}
                  className="btn btn-secondary flex-1"
                >
                  ✕ ถ่ายใหม่
                </button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />

          {loading && (
            <div className="mt-4 text-center">
              <div className="spinner inline-block"></div>
              <p className="text-sm text-gray-600 mt-2">กำลังจดจำข้อความ...</p>
            </div>
          )}
        </div>

        {/* Form Section */}
        <div className="card border-l-4 border-green-500">
          <h3 className="text-lg font-bold mb-4">ข้อมูลจากรูปภาพ</h3>

          {ocrText && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              <p className="font-medium text-blue-900 mb-1">ข้อความจากรูป:</p>
              <p className="text-blue-800 whitespace-pre-wrap">{ocrText}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">สาขา *</label>
              <select
                value={formData.branch_id}
                onChange={(e) =>
                  setFormData({ ...formData, branch_id: e.target.value })
                }
                className="form-select"
                required
              >
                <option value="">เลือกสาขา</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">ยา *</label>
              <select
                value={formData.product_id}
                onChange={(e) =>
                  setFormData({ ...formData, product_id: e.target.value })
                }
                className="form-select"
                required
              >
                <option value="">เลือกยา</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">เลขล็อต *</label>
              <input
                type="text"
                value={formData.lot_number}
                onChange={(e) =>
                  setFormData({ ...formData, lot_number: e.target.value })
                }
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">วันหมดอายุ *</label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) =>
                  setFormData({ ...formData, expiry_date: e.target.value })
                }
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">จำนวน *</label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="form-input"
                required
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-sm text-yellow-800">
                ℹ️ บันทึกจากรูปภาพจะต้องได้รับการยืนยันจากผู้ดูแลระบบก่อนการใช้
              </p>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              บันทึกข้อมูล (รอยืนยัน)
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
