import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function POST(request: NextRequest) {
  try {
    const { branchId, riskLevel } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get at-risk records
    const today = new Date().toISOString().split('T')[0]
    let query = supabase
      .from('expiry_records')
      .select('*, products(name), branches(name, phone)')

    if (branchId) {
      query = query.eq('branch_id', branchId)
    }

    if (riskLevel === 'critical') {
      const thirtyDaysAhead = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
      query = query
        .gte('expiry_date', today)
        .lte('expiry_date', thirtyDaysAhead)
    } else if (riskLevel === 'expired') {
      query = query.lt('expiry_date', today)
    }

    const { data: records } = await query

    if (!records || records.length === 0) {
      return NextResponse.json({ message: 'No at-risk items' })
    }

    // Get admin emails
    const { data: admins } = await supabase
      .from('user_branches')
      .select('auth_user_id')
      .eq('role', 'admin')

    // Get email addresses from auth users
    const adminEmails = admins?.map((a) => a.auth_user_id) || []

    // Generate email content
    const emailContent = generateEmailContent(records, riskLevel)

    // Send emails to admins
    const recipients = adminEmails.length > 0 ? adminEmails.join(',') : 'admin@pharmacy.local'

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipients,
      subject: `⚠️ แจ้งเตือน: ยาหมดอายุ (${riskLevel})`,
      html: emailContent,
    })

    // Store notification log
    await supabase.from('notification_logs').insert({
      type: 'email',
      branch_id: branchId,
      risk_level: riskLevel,
      recipients_count: adminEmails.length,
      sent_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: `ส่งอีเมลไปยัง ${adminEmails.length} ผู้ดูแลระบบ`,
    })
  } catch (error) {
    console.error('Email notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

function generateEmailContent(records: any[], riskLevel: string): string {
  const riskLabels: Record<string, string> = {
    critical: '⚠️ เร่งด่วน (≤30 วัน)',
    expired: '🚨 หมดอายุแล้ว',
    high: '🟠 สูง (31-60 วัน)',
  }

  const recordsHtml = records
    .map(
      (r) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.branches?.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.products?.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.lot_number}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(r.expiry_date).toLocaleDateString('th-TH')}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.quantity}</td>
        </tr>`
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th { background: #f3f4f6; padding: 10px; text-align: left; border-bottom: 2px solid #d1d5db; }
        .footer { color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${riskLabels[riskLevel] || 'แจ้งเตือนยาหมดอายุ'}</h1>
      </div>
      <div class="content">
        <p>สวัสดี,</p>
        <p>มีรายการยาที่ต้องการความสนใจ ${records.length} รายการ</p>

        <table class="table">
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
            ${recordsHtml}
          </tbody>
        </table>

        <p>โปรดตรวจสอบและดำเนินการทันที</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">เปิดแดชบอร์ด</a></p>
      </div>
      <div class="footer">
        <p>ระบบบริหารจัดการยาหมดอายุ | Pharmacy Expiry Management System</p>
      </div>
    </body>
    </html>
  `
}
