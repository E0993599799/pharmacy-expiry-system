'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Product } from '@/lib/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    sku: '',
    unit: '',
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('products').insert([formData])

      if (error) throw error

      setFormData({ name: '', generic_name: '', sku: '', unit: '' })
      setShowForm(false)
      fetchProducts()
    } catch (err) {
      console.error('Error adding product:', err)
      alert('ไม่สามารถเพิ่มยาได้')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">จัดการยา</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          ➕ เพิ่มยาใหม่
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-8 border-l-4 border-blue-500">
          <h3 className="text-lg font-bold mb-4">เพิ่มยาใหม่</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">ชื่อยา *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">ชื่อทั่วไป</label>
              <input
                type="text"
                value={formData.generic_name}
                onChange={(e) =>
                  setFormData({ ...formData, generic_name: e.target.value })
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">หน่วย</label>
              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="form-select"
              >
                <option value="">เลือก</option>
                <option value="tablet">เม็ด (tablet)</option>
                <option value="capsule">แคปซูล (capsule)</option>
                <option value="bottle">ขวด (bottle)</option>
                <option value="box">กล่อง (box)</option>
                <option value="strip">แถบ (strip)</option>
                <option value="ml">มิลลิลิตร (ml)</option>
              </select>
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

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">ไม่มียาในฐานข้อมูล</p>
          <p className="text-sm text-gray-500">เพิ่มยาใหม่เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>ชื่อยา</th>
                <th>ชื่อทั่วไป</th>
                <th>SKU</th>
                <th>หน่วย</th>
                <th>เพิ่มเมื่อ</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="font-medium">{product.name}</td>
                  <td>{product.generic_name || '-'}</td>
                  <td className="text-sm text-gray-600">{product.sku || '-'}</td>
                  <td>{product.unit || '-'}</td>
                  <td className="text-sm text-gray-500">
                    {new Date(product.created_at).toLocaleDateString('th-TH')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
