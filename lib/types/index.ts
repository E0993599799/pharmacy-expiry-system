export type UserRole = 'admin' | 'branch_user'

export interface User {
  id: string
  email: string
  role: UserRole
  branch_id?: string
  full_name?: string
  created_at: string
}

export interface Branch {
  id: string
  name: string
  location?: string
  phone?: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  generic_name?: string
  sku?: string
  unit?: string
  description?: string
  created_at: string
}

export type RiskLevel = 'expired' | 'critical' | 'high' | 'medium' | 'normal'

export interface ExpiryRecord {
  id: string
  branch_id: string
  product_id: string
  lot_number: string
  expiry_date: string
  quantity: number
  quantity_unit?: string
  notes?: string
  source_type: 'manual' | 'photo' | 'pdf' | 'line' | 'other'
  photo_url?: string
  pdf_url?: string
  ocr_raw_text?: string
  ai_extracted_json?: Record<string, unknown>
  ai_confidence?: number
  confirmation_status: 'unconfirmed' | 'confirmed' | 'rejected'
  created_by: string
  created_at: string
  updated_at: string
  risk_level?: RiskLevel
}

export interface DashboardStats {
  expired: number
  expiring_30_days: number
  expiring_60_days: number
  expiring_90_days: number
  missing_expiry: number
  total_products: number
}
