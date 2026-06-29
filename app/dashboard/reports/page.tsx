'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ExpiryRecord, Product, Branch } from '@/lib/types'
import { calculateRiskLevel, getRiskColor, getRiskLabel } from '@/lib/utils/risk'

export default function ReportsPage() {
  const [records, setRecords] = useState<ExpiryRecord[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'by-risk' | 'by-branch' | 'by-product'>('by-risk')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: userBranches } = await supabase
        .from('user_branches')
        .select('branch_id, role')
        .eq('auth_user_id', session.user.id)

      let branchQuery = supabase.from('branches').select('*')
      let recordsQuery = supabase
        .from('expiry_records')
        .select('*')
        .order('expiry_date', { ascending: true })

      if (userBranches && userBranches.length > 0) {
        const role = userBranches[0].role
        if (role === 'branch_user') {
          const branchIds = userBranches.map((b) => b.branch_id)
          branchQuery = branchQuery.in('id', branchIds)
          recordsQuery = recordsQuery.in('branch_id', branchIds)
        }
      }

      const { data: branchesData } = await branchQuery
      setBranches(branchesData || [])

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('name')
      setProducts(productsData || [])

      const { data: recordsData } = await recordsQuery
      setRecords(recordsData || [])
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
      </div>
    )
  }

  // By Risk
  const byRisk = {
    expired: records.filter((r) => calculateRiskLevel(r.expiry_date) === 'expired'),
    critical: records.filter((r) => calculateRiskLevel(r.expiry_date) === 'critical'),
    high: records.filter((r) => calculateRiskLevel(r.expiry_date) === 'high'),
    medium: records.filter((r) => calculateRiskLevel(r.expiry_date) === 'medium'),
    normal: records.filter((r) => calculateRiskLevel(r.expiry_date) === 'normal'),
  }

  // By Branch
  const byBranch = branches.map((branch) => ({
    branch,
    count: records.filter((r) => r.branch_id === branch.id).length,
    records: records.filter((r) => r.branch_id === branch.id),
  }))

  // By Product
  const byProduct = products.map((product) => ({
    product,
    count: records.filter((r) => r.product_id === product.id).length,
    records: records.filter((r) => r.product_id === product.id),
  })).filter((p) => p.count > 0)

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8 text-gray-900">รายงาน</h2>

      {/* Tabs */}
      <div className="card mb-8">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('by-risk')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'by-risk'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent'
            }`}
          >
            ตามความเสี่ยง
          </button>
          <button
            onClick={() => setActiveTab('by-branch')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'by-branch'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent'
            }`}
          >
            ตามสาขา
          </button>
          <button
            onClick={() => setActiveTab('by-product')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'by-product'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent'
            }`}
          >
            ตามยา
          </button>
        </div>
      </div>

      {/* By Risk */}
      {activeTab === 'by-risk' && (
        <div className="space-y-6">
          {[
            { key: 'expired', label: 'หมดอายุแล้ว', color: 'bg-red-900 text-white' },
            { key: 'critical', label: 'เร่งด่วน (≤30 วัน)', color: 'bg-red-500 text-white' },
            { key: 'high', label: 'สูง (31-60 วัน)', color: 'bg-orange-500 text-white' },
            { key: 'medium', label: 'ปกติ (61-90 วัน)', color: 'bg-yellow-500 text-white' },
            { key: 'normal', label: 'ปลอดภัย (>90 วัน)', color: 'bg-green-500 text-white' },
          ].map(({ key, label, color }) => (
            <div key={key} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold px-4 py-2 rounded text-white ${color}`}>
                  {label}
                </h3>
                <span className="text-2xl font-bold text-gray-900">
                  {byRisk[key as keyof typeof byRisk].length}
                </span>
              </div>

              {byRisk[key as keyof typeof byRisk].length === 0 ? (
                <p className="text-gray-600">ไม่มีรายการ</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>สาขา</th>
                        <th>ยา</th>
                        <th>เลขล็อต</th>
                        <th>วันหมดอายุ</th>
                        <th>จำนวน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byRisk[key as keyof typeof byRisk].map((record) => {
                        const branch = branches.find((b) => b.id === record.branch_id)
                        const product = products.find((p) => p.id === record.product_id)
                        return (
                          <tr key={record.id}>
                            <td>{branch?.name}</td>
                            <td>{product?.name}</td>
                            <td className="text-sm">{record.lot_number}</td>
                            <td>{new Date(record.expiry_date).toLocaleDateString('th-TH')}</td>
                            <td>{record.quantity}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* By Branch */}
      {activeTab === 'by-branch' && (
        <div className="space-y-6">
          {byBranch.map(({ branch, count, records: branchRecords }) => (
            <div key={branch.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{branch.name}</h3>
                <span className="text-2xl font-bold text-gray-600">{count}</span>
              </div>

              {count === 0 ? (
                <p className="text-gray-600">ไม่มีรายการ</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ยา</th>
                        <th>เลขล็อต</th>
                        <th>วันหมดอายุ</th>
                        <th>ความเสี่ยง</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branchRecords.map((record) => {
                        const product = products.find((p) => p.id === record.product_id)
                        const risk = calculateRiskLevel(record.expiry_date)
                        return (
                          <tr key={record.id}>
                            <td>{product?.name}</td>
                            <td className="text-sm">{record.lot_number}</td>
                            <td>{new Date(record.expiry_date).toLocaleDateString('th-TH')}</td>
                            <td>
                              <span className={`badge ${getRiskColor(risk)}`}>
                                {getRiskLabel(risk, 'th')}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* By Product */}
      {activeTab === 'by-product' && (
        <div className="space-y-6">
          {byProduct.map(({ product, count, records: productRecords }) => (
            <div key={product.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                <span className="text-2xl font-bold text-gray-600">{count}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>สาขา</th>
                      <th>เลขล็อต</th>
                      <th>วันหมดอายุ</th>
                      <th>จำนวน</th>
                      <th>ความเสี่ยง</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productRecords.map((record) => {
                      const branch = branches.find((b) => b.id === record.branch_id)
                      const risk = calculateRiskLevel(record.expiry_date)
                      return (
                        <tr key={record.id}>
                          <td>{branch?.name}</td>
                          <td className="text-sm">{record.lot_number}</td>
                          <td>{new Date(record.expiry_date).toLocaleDateString('th-TH')}</td>
                          <td>{record.quantity}</td>
                          <td>
                            <span className={`badge ${getRiskColor(risk)}`}>
                              {getRiskLabel(risk, 'th')}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {byProduct.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-gray-600">ไม่มีรายการ</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
