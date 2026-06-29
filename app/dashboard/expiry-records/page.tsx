'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ExpiryRecord, Product, Branch } from '@/lib/types'
import { calculateRiskLevel, getRiskColor, getRiskLabel } from '@/lib/utils/risk'

export default function ExpiryRecordsPage() {
  const [records, setRecords] = useState<ExpiryRecord[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterBranch, setFilterBranch] = useState('all')
  const [filterRisk, setFilterRisk] = useState('all')

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
    try {
      setLoading(true)

      // Fetch user's role and branches
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: userBranches } = await supabase
        .from('user_branches')
        .select('branch_id, role')
        .eq('auth_user_id', session.user.id)

      let branchQuery = supabase.from('branches').select('*')
      if (userBranches && userBranches.length > 0) {
        const role = userBranches[0].role
        if (role === 'branch_user') {
          const branchIds = userBranches.map((b) => b.branch_id)
          branchQuery = branchQuery.in('id', branchIds)
        }
      }

      const { data: branchesData } = await branchQuery
      setBranches(branchesData || [])
      if (branchesData && branchesData.length > 0) {
        setFormData((prev) => ({ ...prev, branch_id: branchesData[0].id }))
      }

      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('name')
      setProducts(productsData || [])

      // Fetch expiry records
      let recordsQuery = supabase
        .from('expiry_records')
        .select('*')
        .order('expiry_date', { ascending: true })

      if (userBranches && userBranches.length > 0) {
        const role = userBranches[0].role
        if (role === 'branch_user') {
          const branchIds = userBranches.map((b) => b.branch_id)
          recordsQuery = recordsQuery.in('branch_id', branchIds)
        }
      }

      const { data: recordsData } = await recordsQuery
      setRecords(recordsData || [])
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
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
        confirmation_status: 'confirmed',
        source_type: 'manual',
      }

      const { error } = await supabase
        .from('expiry_records')
        .insert([recordToInsert])

      if (error) throw error

      setFormData({
        branch_id: formData.branch_id,
        product_id: '',
        lot_number: '',
        expiry_date: '',
        quantity: '',
        quantity_unit: 'box',
        notes: '',
      })
      setShowForm(false)
      fetchData()
    } catch (err) {
      console.error('Error adding record:', err)
      alert('ไม่สามารถบันทึกข้อมูลได้')
    }
  }

  const filteredRecords = records.filter((record) => {
    if (filterBranch !== 'all' && record.branch_id !== filterBranch) return false
    if (filterRisk !== 'all' && record.risk_level !== filterRisk) return false
    return true
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">บันทึกอายุการใช้</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          ➕ บันทึกใหม่
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-8 border-l-4 border-blue-500">
          <h3 className="text-lg font-bold mb-4">บันทึกข้อมูลอายุการใช้</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="form-label">เลขล็อต/แบทช์ *</label>
              <input
                type="text"
                value={formData.lot_number}
                onChange={(e) =>
                  setFormData({ ...formData, lot_number: e.target.value })
                }
                placeholder="ป้อนเลขล็อต"
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
                placeholder="0"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">หน่วย</label>
              <select
                value={formData.quantity_unit}
                onChange={(e) =>
                  setFormData({ ...formData, quantity_unit: e.target.value })
                }
                className="form-select"
              >
                <option value="box">กล่อง</option>
                <option value="strip">แถบ</option>
                <option value="tablet">เม็ด</option>
                <option value="bottle">ขวด</option>
                <option value="ml">มิลลิลิตร</option>
              </select>
            </div>

            <div className="form-group md:col-span-2">
              <label className="form-label">หมายเหตุ</label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="ข้อมูลเพิ่มเติม"
                className="form-textarea"
                rows={3}
              ></textarea>
            </div>

            <div className="col-span-1 md:col-span-2 flex gap-2">
              <button type="submit" className="btn btn-primary flex-1">
                บันทึก
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary flex-1"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-8 flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-600 block mb-2">
            สาขา
          </label>
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="form-select"
          >
            <option value="all">ทั้งหมด</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium text-gray-600 block mb-2">
            ระดับความเสี่ยง
          </label>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="form-select"
          >
            <option value="all">ทั้งหมด</option>
            <option value="expired">หมดอายุแล้ว</option>
            <option value="critical">เร่งด่วน</option>
            <option value="high">สูง</option>
            <option value="medium">ปกติ</option>
            <option value="normal">ปลอดภัย</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">ไม่มีบันทึกข้อมูล</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>สาขา</th>
                <th>ยา</th>
                <th>เลขล็อต</th>
                <th>วันหมดอายุ</th>
                <th>จำนวน</th>
                <th>ความเสี่ยง</th>
                <th>เพิ่มเมื่อ</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => {
                const branch = branches.find((b) => b.id === record.branch_id)
                const product = products.find((p) => p.id === record.product_id)
                const riskLevel = record.risk_level || calculateRiskLevel(record.expiry_date)

                return (
                  <tr key={record.id}>
                    <td className="font-medium">{branch?.name}</td>
                    <td>{product?.name}</td>
                    <td className="text-sm text-gray-600">{record.lot_number}</td>
                    <td>{new Date(record.expiry_date).toLocaleDateString('th-TH')}</td>
                    <td>
                      {record.quantity} {record.quantity_unit}
                    </td>
                    <td>
                      <span className={`badge ${getRiskColor(riskLevel)}`}>
                        {getRiskLabel(riskLevel, 'th')}
                      </span>
                    </td>
                    <td className="text-sm text-gray-500">
                      {new Date(record.created_at).toLocaleDateString('th-TH')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
