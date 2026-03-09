import { NextRequest, NextResponse } from 'next/server'

const BREVO_API_KEY = process.env.BREVO_API_KEY || ''

export async function POST(req: NextRequest) {
  if (!BREVO_API_KEY) {
    return NextResponse.json({ error: 'BREVO_API_KEY not set' }, { status: 500 })
  }

  try {
    const { to, name, subject, html } = await req.json()
    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'EveryGiving', email: 'business@everygiving.org' },
        to: [{ email: to, name: name || '' }],
        subject,
        htmlContent: html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Brevo send error:', err)
      return NextResponse.json({ error: err }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('send-status-email error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
