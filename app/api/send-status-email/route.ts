import { NextRequest, NextResponse } from 'next/server'

interface RequestBody {
  to:     string
  name:   string
  title:  string
  status: 'approved' | 'rejected'
  note:   string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const BREVO_API_KEY = process.env.BREVO_API_KEY
  const SENDER_EMAIL  = process.env.SENDER_EMAIL ?? 'business@everygiving.org'
  const SENDER_NAME   = 'EveryGiving'
  const APP_URL       = process.env.NEXT_PUBLIC_APP_URL ?? 'https://everygiving.org'

  if (!BREVO_API_KEY) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 503 })
  }

  let body: RequestBody
  try {
    body = (await req.json()) as RequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { to, name, title, status, note } = body
  if (!to || !name || !title || !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!isValidEmail(to)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }
  if (status !== 'approved' && status !== 'rejected') {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const isApproved = status === 'approved'

  const subject = isApproved
    ? `Your campaign is live on EveryGiving!`
    : `Update on your EveryGiving campaign`

  const htmlContent = isApproved
    ? `
      <div style="font-family:'Nunito Sans',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:#02A95C;padding:32px 32px 24px;text-align:center">
          <h1 style="font-family:Nunito,Arial,sans-serif;color:#fff;font-size:22px;font-weight:900;margin:0">EveryGiving</h1>
        </div>
        <div style="padding:32px">
          <h2 style="font-family:Nunito,Arial,sans-serif;color:#16233A;font-size:20px;font-weight:900;margin:0 0 8px">Your campaign is live! 🎉</h2>
          <p style="color:#6b7280;font-size:15px;margin:0 0 20px">Hi ${name}, great news!</p>
          <p style="color:#374151;font-size:15px;margin:0 0 20px">Your campaign <strong>"${title}"</strong> has been reviewed and approved. It is now live on EveryGiving and people can start donating.</p>
          <div style="text-align:center;margin:28px 0">
            <a href="${APP_URL}/campaigns" style="background:#02A95C;color:#fff;font-family:Nunito,Arial,sans-serif;font-weight:900;font-size:15px;padding:14px 32px;border-radius:50px;text-decoration:none;display:inline-block">View your campaign</a>
          </div>
          ${note ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-top:8px"><p style="color:#15803d;font-size:14px;margin:0"><strong>Note from our team:</strong> ${note}</p></div>` : ''}
          <p style="color:#9ca3af;font-size:13px;margin-top:24px">Share your campaign on WhatsApp and Facebook to raise funds faster. Good luck!</p>
        </div>
        <div style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb">
          <p style="color:#9ca3af;font-size:12px;margin:0">EveryGiving &mdash; Ghana's trusted crowdfunding platform</p>
        </div>
      </div>`
    : `
      <div style="font-family:'Nunito Sans',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:#16233A;padding:32px 32px 24px;text-align:center">
          <h1 style="font-family:Nunito,Arial,sans-serif;color:#fff;font-size:22px;font-weight:900;margin:0">EveryGiving</h1>
        </div>
        <div style="padding:32px">
          <h2 style="font-family:Nunito,Arial,sans-serif;color:#16233A;font-size:20px;font-weight:900;margin:0 0 8px">Campaign update</h2>
          <p style="color:#6b7280;font-size:15px;margin:0 0 20px">Hi ${name},</p>
          <p style="color:#374151;font-size:15px;margin:0 0 20px">After review, your campaign <strong>"${title}"</strong> was not approved at this time.</p>
          ${note ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:0 0 20px"><p style="color:#b91c1c;font-size:14px;margin:0"><strong>Reason:</strong> ${note}</p></div>` : ''}
          <p style="color:#374151;font-size:15px;margin:0 0 20px">You are welcome to resubmit your campaign after addressing the feedback above.</p>
          <div style="text-align:center;margin:28px 0">
            <a href="${APP_URL}/create" style="background:#16233A;color:#fff;font-family:Nunito,Arial,sans-serif;font-weight:900;font-size:15px;padding:14px 32px;border-radius:50px;text-decoration:none;display:inline-block">Resubmit campaign</a>
          </div>
          <p style="color:#9ca3af;font-size:13px">Questions? Reply to this email and our team will help you.</p>
        </div>
        <div style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb">
          <p style="color:#9ca3af;font-size:12px;margin:0">EveryGiving &mdash; Ghana's trusted crowdfunding platform</p>
        </div>
      </div>`

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key':      BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender:      { name: SENDER_NAME, email: SENDER_EMAIL },
        to:          [{ email: to, name }],
        subject,
        htmlContent,
      }),
    })

    if (!res.ok) {
      const errBody = await res.text()
      console.error('Brevo error:', res.status, errBody)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('send-status-email error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
