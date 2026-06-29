'use client'

import { useState } from 'react'

export default function LineBotPage() {
  const [webhookUrl] = useState(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/line/webhook`
  )

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8 text-gray-900">LINE Bot ตั้งค่า</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Setup Guide */}
        <div className="card border-l-4 border-green-500">
          <h3 className="text-lg font-bold mb-4">📋 ขั้นตอนการตั้งค่า</h3>

          <div className="space-y-4 text-sm">
            <div>
              <p className="font-bold text-green-700">1. สร้าง LINE Official Account</p>
              <p className="text-gray-600 mt-1">
                ไปที่ LINE Business Center และสร้าง Official Account สำหรับร้านขายยา
              </p>
            </div>

            <div>
              <p className="font-bold text-green-700">2. ได้ Channel Access Token</p>
              <p className="text-gray-600 mt-1">
                เข้า LINE Developers → Create Channel → Get Channel Access Token
              </p>
            </div>

            <div>
              <p className="font-bold text-green-700">3. ตั้ง Webhook URL</p>
              <p className="text-gray-600 mt-1">
                ในการตั้งค่า Channel, ตั้ง Webhook URL เป็น:
              </p>
              <div className="mt-2 bg-gray-100 p-3 rounded break-all font-mono text-xs">
                {webhookUrl}
              </div>
            </div>

            <div>
              <p className="font-bold text-green-700">4. ตั้ง Environment Variables</p>
              <p className="text-gray-600 mt-1">
                เพิ่มตัวแปรสภาพแวดล้อม:
              </p>
              <ul className="mt-2 text-xs text-gray-700 space-y-1">
                <li>
                  <code className="bg-gray-100 px-1">
                    LINE_CHANNEL_ACCESS_TOKEN=your-token
                  </code>
                </li>
                <li>
                  <code className="bg-gray-100 px-1">
                    LINE_CHANNEL_SECRET=your-secret
                  </code>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-green-700">5. เปิด Webhook</p>
              <p className="text-gray-600 mt-1">
                ในการตั้งค่า Channel, เปิด "Use webhook"
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="card border-l-4 border-blue-500">
          <h3 className="text-lg font-bold mb-4">✨ ความสามารถ</h3>

          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="font-bold text-blue-900">📊 ถามสถิติ</p>
              <p className="text-sm text-blue-800 mt-1">
                "สถิติ" - แสดงจำนวนยาหมดอายุและเร่งด่วน
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="font-bold text-blue-900">🚨 แจ้งเตือน</p>
              <p className="text-sm text-blue-800 mt-1">
                "หมดอายุ" - ดูรายการยาหมดอายุทั้งหมด
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="font-bold text-blue-900">🔗 ลิงก์ด่วน</p>
              <p className="text-sm text-blue-800 mt-1">
                Bot ส่งลิงก์ไปยังแดชบอร์ดเพื่อการจัดการเต็ม
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="font-bold text-blue-900">💾 บันทึก</p>
              <p className="text-sm text-blue-800 mt-1">
                ปฏิสัมพันธ์ทั้งหมดจะถูกบันทึกสำหรับการตรวจสอบ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Commands Reference */}
      <div className="card mt-8 bg-gray-50">
        <h3 className="text-lg font-bold mb-4">📖 คำสั่ง LINE Bot</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left p-2">คำสั่ง</th>
                <th className="text-left p-2">ตอบสนอง</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="p-2 font-mono">สถิติ / stats</td>
                <td className="p-2">แสดงจำนวนยาตามความเสี่ยง</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="p-2 font-mono">หมดอายุ / expired</td>
                <td className="p-2">แสดงรายการยาหมดอายุแล้ว</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="p-2 font-mono">เร่งด่วน / critical</td>
                <td className="p-2">แสดงยาที่เร่งด่วนสำหรับการดำเนินการ</td>
              </tr>
              <tr>
                <td className="p-2 font-mono">อื่น ๆ</td>
                <td className="p-2">แสดงเมนูช่วยเหลือ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Status */}
      <div className="card mt-8 border-l-4 border-green-500">
        <h3 className="text-lg font-bold mb-2">✓ สถานะ</h3>
        <div className="space-y-1 text-sm">
          <p>
            <span className="inline-block w-24">Webhook URL:</span>
            <code className="bg-gray-100 px-2 py-1 rounded break-all text-xs">
              {webhookUrl}
            </code>
          </p>
          <p>
            <span className="inline-block w-24">สถานะ:</span>
            <span className="text-green-600 font-bold">พร้อม (ต้องตั้ง Environment Var)</span>
          </p>
        </div>
      </div>
    </div>
  )
}
