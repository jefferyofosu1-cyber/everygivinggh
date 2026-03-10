import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const BREVO_API_KEY = process.env.BREVO_API_KEY || ''
const APP_URL       = process.env.NEXT_PUBLIC_APP_URL || 'https://everygiving.org'

// ─── Email templates ─────────────────────────────────────────────────────────

function approvedHtml(name: string, title: string, note: string): string {
  const noteBlock = note
    ? `<div style="background:#F8FAFC;border-radius:12px;padding:16px;margin-bottom:24px">
        <div style="font-size:11px;color:#94A3B8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Note from our team</div>
        <div style="font-size:14px;color:#475569">${note}</div>
       </div>`
    : ''
  return `<!DOCTYPE html><html><body style="margin:0;background:#F1F5F9;font-family:Arial,sans-serif">
<div style="max-width:580px;margin:32px auto;padding:0 16px">
  <div style="background:#1A2B3C;border-radius:20px 20px 0 0;padding:32px 40px;text-align:center">
    <div style="font-size:26px;font-weight:900"><span style="color:#02A95C">Every</span><span style="color:white">Giving</span></div>
    <div style="color:rgba(255,255,255,.4);font-size:11px;margin-top:4px;text-transform:uppercase;letter-spacing:.1em">Ghana's trusted crowdfunding platform</div>
  </div>
  <div style="background:#02A95C;padding:28px 40px;text-align:center">
    <div style="font-size:40px;margin-bottom:8px">🎉</div>
    <div style="color:white;font-size:24px;font-weight:900">Your campaign is live, ${name}!</div>
  </div>
  <div style="background:white;padding:40px">
    <p style="font-size:15px;color:#475569;line-height:1.7;margin-bottom:24px">
      Your campaign <strong style="color:#1A2B3C">"${title}"</strong> has been
      <strong style="color:#02A95C">approved</strong> and is now live on EveryGiving.
      Donors can find and support it right now.
    </p>
    <div style="background:#F0FDF6;border:1.5px solid rgba(2,169,92,.2);border-radius:16px;padding:20px;margin-bottom:24px">
      <div style="font-size:12px;font-weight:800;color:#1A2B3C;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">What to do now</div>
      <div style="display:flex;gap:10px;margin-bottom:10px;align-items:flex-start"><span>📲</span><span style="font-size:13px;color:#475569">Share your link on WhatsApp, Facebook, and Instagram immediately</span></div>
      <div style="display:flex;gap:10px;margin-bottom:10px;align-items:flex-start"><span>👨‍👩‍👧</span><span style="font-size:13px;color:#475569">Message your closest contacts first - they are your best first donors</span></div>
      <div style="display:flex;gap:10px;align-items:flex-start"><span>📝</span><span style="font-size:13px;color:#475569">Post regular updates - donors give more to active campaigns</span></div>
    </div>
    ${noteBlock}
    <div style="text-align:center;margin:28px 0">
      <a href="${APP_URL}/campaigns" style="display:inline-block;background:#02A95C;color:white;font-weight:900;font-size:15px;padding:16px 44px;border-radius:9999px;text-decoration:none">View your campaign</a>
    </div>
    <p style="font-size:13px;color:#94A3B8;text-align:center">Questions? Reply to this email - we are here to help.</p>
  </div>
  <div style="background:#1A2B3C;border-radius:0 0 20px 20px;padding:20px 40px;text-align:center">
    <div style="font-size:18px;font-weight:900"><span style="color:#02A95C">Every</span><span style="color:white">Giving</span></div>
    <div style="font-size:11px;color:rgba(255,255,255,.2);margin-top:4px">everygiving.org</div>
  </div>
</div></body></html>`
}

function rejectedHtml(name: string, title: string, note: string): string {
  const reason = note || 'Please contact us at business@everygiving.org and we will explain what needs to be corrected.'
  return `<!DOCTYPE html><html><body style="margin:0;background:#F1F5F9;font-family:Arial,sans-serif">
<div style="max-width:580px;margin:32px auto;padding:0 16px">
  <div style="background:#1A2B3C;border-radius:20px 20px 0 0;padding:32px 40px;text-align:center">
    <div style="font-size:26px;font-weight:900"><span style="color:#02A95C">Every</span><span style="color:white">Giving</span></div>
    <div style="color:rgba(255,255,255,.4);font-size:11px;margin-top:4px;text-transform:uppercase;letter-spacing:.1em">Ghana's trusted crowdfunding platform</div>
  </div>
  <div style="background:#EF4444;padding:28px 40px;text-align:center">
    <div style="font-size:40px;margin-bottom:8px">⚠️</div>
    <div style="color:white;font-size:22px;font-weight:900">Campaign not approved, ${name}</div>
  </div>
  <div style="background:white;padding:40px">
    <p style="font-size:15px;color:#475569;line-height:1.7;margin-bottom:24px">
      We reviewed <strong style="color:#1A2B3C">"${title}"</strong> and unfortunately could not approve it at this time.
    </p>
    <div style="background:#FEF2F2;border:1.5px solid rgba(239,68,68,.2);border-radius:16px;padding:20px;margin-bottom:24px">
      <div style="font-size:12px;font-weight:800;color:#1A2B3C;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Reason</div>
      <div style="font-size:14px;color:#475569;line-height:1.6">${reason}</div>
    </div>
    <div style="background:#F8FAFC;border-radius:12px;padding:16px;margin-bottom:24px">
      <div style="font-size:13px;font-weight:700;color:#1A2B3C;margin-bottom:6px">What can you do?</div>
      <div style="font-size:13px;color:#475569;line-height:1.6">Reply to this email and we will help you fix the issue and resubmit. We review every campaign personally and want to help you succeed.</div>
    </div>
    <div style="text-align:center;margin:28px 0">
      <a href="mailto:business@everygiving.org" style="display:inline-block;background:#1A2B3C;color:white;font-weight:900;font-size:14px;padding:14px 36px;border-radius:9999px;text-decoration:none">Reply to appeal</a>
    </div>
  </div>
  <div style="background:#1A2B3C;border-radius:0 0 20px 20px;padding:20px 40px;text-align:center">
    <div style="font-size:18px;font-weight:900"><span style="color:#02A95C">Every</span><span style="color:white">Giving</span></div>
    <div style="font-size:11px;color:rgba(255,255,255,.2);margin-top:4px">everygiving.org</div>
  </div>
</div></body></html>`
}

// ─── POST handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!BREVO_API_KEY) {
    return NextResponse.json({ error: 'Email service not configured.' }, { status: 500 })
  }

  // Admin only
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: 'Auth check failed.' }, { status: 500 })
  }

  try {
    const body: Record<string, unknown> = await req.json()

    const to     = typeof body.to     === 'string' ? body.to.trim()    : ''
    const name   = typeof body.name   === 'string' ? body.name.trim()  : 'there'
    const title  = typeof body.title  === 'string' ? body.title.trim() : ''
    const status = typeof body.status === 'string' ? body.status       : ''
    const note   = typeof body.note   === 'string' ? body.note.trim()  : ''

    if (!to || !title || !status) {
      return NextResponse.json({ error: 'Missing required fields: to, title, status.' }, { status: 400 })
    }

    const isApproved = status === 'approved'
    const subject = isApproved
      ? `Your campaign "${title}" is live!`
      : `Update on your campaign "${title}"`
    const html = isApproved
      ? approvedHtml(name, title, note)
      : rejectedHtml(name, title, note)

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'EveryGiving', email: 'business@everygiving.org' },
        to: [{ email: to, name }],
        subject,
        htmlContent: html,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Brevo error:', errText)
      return NextResponse.json({ error: errText }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error.'
    console.error('send-status-email error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
