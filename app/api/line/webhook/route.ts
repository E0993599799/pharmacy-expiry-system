import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET!
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const events = body.events || []

    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        await handleTextMessage(event)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('LINE webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}

async function handleTextMessage(event: any) {
  const userId = event.source.userId
  const text = event.message.text
  const replyToken = event.replyToken

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let replyText = ''

  if (text.includes('หมดอายุ') || text.includes('expired')) {
    // Get expiry stats
    const { data: records } = await supabase
      .from('expiry_records')
      .select('*, products(name)')
      .lt('expiry_date', new Date().toISOString().split('T')[0])

    replyText = `🚨 ยาหมดอายุ: ${records?.length || 0} รายการ\n\nกรุณาเข้าแดชบอร์ดเพื่อดูรายละเอียด`
  } else if (text.includes('สถิติ') || text.includes('stats')) {
    const today = new Date().toISOString().split('T')[0]
    const thirtyDaysAhead = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    const { count: expired } = await supabase
      .from('expiry_records')
      .select('*', { count: 'exact', head: true })
      .lt('expiry_date', today)

    const { count: critical } = await supabase
      .from('expiry_records')
      .select('*', { count: 'exact', head: true })
      .gte('expiry_date', today)
      .lte('expiry_date', thirtyDaysAhead)

    replyText = `📊 สถิติอายุการใช้:\n\n🚨 หมดอายุ: ${expired || 0}\n⚠️ เร่งด่วน: ${critical || 0}\n\nกรุณาเข้าแดชบอร์ดเพื่อการจัดการเต็ม`
  } else {
    replyText = `สวัสดี! ฉันสามารถช่วยคุณได้:\n\n• "หมดอายุ" - แสดงยาหมดอายุ\n• "สถิติ" - แสดงสถิติทั่วไป\n\nสำหรับการจัดการเต็มรูปแบบ โปรดเข้าแดชบอร์ด`
  }

  // Send LINE reply
  await sendLineMessage(replyToken, replyText)

  // Log interaction
  await supabase.from('line_interactions').insert({
    user_id: userId,
    message: text,
    reply: replyText,
    timestamp: new Date().toISOString(),
  })
}

async function sendLineMessage(replyToken: string, text: string) {
  const response = await fetch('https://api.line.biz/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [
        {
          type: 'text',
          text,
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`LINE API error: ${response.status}`)
  }
}
