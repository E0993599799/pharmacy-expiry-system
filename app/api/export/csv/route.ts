import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branch_id')
    const riskLevel = searchParams.get('risk_level')

    let query = supabase
      .from('expiry_records')
      .select('*, products(name), branches(name)')

    if (branchId) {
      query = query.eq('branch_id', branchId)
    }

    const { data: records, error } = await query

    if (error) throw error

    const filteredRecords = records || []
    const csv = generateCSV(filteredRecords)

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename="expiry-records-${new Date().toISOString()}.csv"`,
      },
    })
  } catch (error) {
    console.error('CSV export error:', error)
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    )
  }
}

function generateCSV(records: any[]): string {
  const headers = [
    'สาขา',
    'ยา',
    'เลขล็อต',
    'วันหมดอายุ',
    'จำนวน',
    'หน่วย',
    'ความเสี่ยง',
    'เพิ่มเมื่อ',
  ]

  const rows = records.map((record) => [
    record.branches?.name || '-',
    record.products?.name || '-',
    record.lot_number,
    formatDateThai(record.expiry_date),
    record.quantity,
    record.quantity_unit || '-',
    getRiskLabelThai(calculateRisk(record.expiry_date)),
    formatDateThai(record.created_at),
  ])

  const csv = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          const str = String(cell)
          return str.includes(',') || str.includes('"')
            ? `"${str.replace(/"/g, '""')}"`
            : str
        })
        .join(',')
    )
    .join('\n')

  return csv
}

function calculateRisk(expiryDate: string): string {
  const today = new Date()
  const expiry = new Date(expiryDate)
  const daysUntilExpiry = Math.floor(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysUntilExpiry < 0) return 'expired'
  if (daysUntilExpiry <= 30) return 'critical'
  if (daysUntilExpiry <= 60) return 'high'
  if (daysUntilExpiry <= 90) return 'medium'
  return 'normal'
}

function getRiskLabelThai(risk: string): string {
  const labels: Record<string, string> = {
    expired: 'หมดอายุแล้ว',
    critical: 'เร่งด่วน',
    high: 'สูง',
    medium: 'ปกติ',
    normal: 'ปลอดภัย',
  }
  return labels[risk] || '-'
}

function formatDateThai(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
