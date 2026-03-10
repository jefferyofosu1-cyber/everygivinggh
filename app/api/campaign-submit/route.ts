import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const BREVO_API_KEY = process.env.BREVO_API_KEY || ''
const ADMIN_EMAIL   = process.env.ADMIN_EMAIL || 'jefferyofosu1@gmail.com'
const APP_URL       = process.env.NEXT_PUBLIC_APP_URL || 'https://everygiving.org'

// ─── Email helper ────────────────────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!BREVO_API_KEY) { console.warn('No BREVO_API_KEY'); return }
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'EveryGiving', email: 'business@everygiving.org' },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    })
    if (!res.ok) console.error('Brevo error:', await res.text())
  } catch (e) {
    console.error('Email failed:', e)
  }
}

// ─── Email templates ─────────────────────────────────────────────────────────

function submittedEmail(name: string, title: string, tier: string, feeAmount: number, feeDeferred: boolean): string {
  const feeNote = feeDeferred && feeAmount > 0
    ? `<div style="font-size:12px;color:#D97706;margin-top:8px;padding:8px 12px;background:#FFFBEB;border-radius:8px;border:1px solid #FDE68A">
        Your verification fee of GH₵${feeAmount} will be deducted from your first donations. You pay nothing today.
       </div>`
    : ''
  return `<!DOCTYPE html><html><body style="margin:0;background:#F1F5F9;font-family:Arial,sans-serif">
<div style="max-width:580px;margin:32px auto;padding:0 16px">
  <div style="background:#1A2B3C;border-radius:20px 20px 0 0;padding:32px 40px;text-align:center">
    <div style="font-size:26px;font-weight:900"><span style="color:#02A95C">Every</span><span style="color:white">Giving</span></div>
    <div style="color:rgba(255,255,255,.4);font-size:11px;margin-top:4px;text-transform:uppercase;letter-spacing:.1em">Ghana's trusted crowdfunding platform</div>
  </div>
  <div style="background:#02A95C;padding:24px 40px;text-align:center">
    <div style="font-size:36px;margin-bottom:8px">🎉</div>
    <div style="color:white;font-size:22px;font-weight:900">Campaign received, ${name}!</div>
  </div>
  <div style="background:white;padding:40px">
    <p style="font-size:15px;color:#475569;line-height:1.7;margin-bottom:24px">
      Your campaign <strong style="color:#1A2B3C">"${title}"</strong> is now <strong style="color:#02A95C">pending review</strong>.
      Our team usually reviews campaigns within 24 hours.
    </p>
    <div style="background:#F0FDF6;border:1.5px solid rgba(2,169,92,.2);border-radius:16px;padding:20px;margin-bottom:24px">
      <div style="font-size:12px;font-weight:800;color:#1A2B3C;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">What happens next</div>
      <div style="display:flex;gap:10px;margin-bottom:10px"><span>🔍</span><span style="font-size:13px;color:#475569">Our team reviews your campaign and identity documents</span></div>
      <div style="display:flex;gap:10px;margin-bottom:10px"><span>✅</span><span style="font-size:13px;color:#475569">Once approved, your campaign goes live and you get a confirmation email</span></div>
      <div style="display:flex;gap:10px"><span>📱</span><span style="font-size:13px;color:#475569">Share on WhatsApp immediately to start receiving donations</span></div>
    </div>
    <div style="background:#F8FAFC;border-radius:12px;padding:16px;margin-bottom:24px">
      <div style="font-size:11px;color:#94A3B8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Campaign details</div>
      <div style="font-size:14px;color:#1A2B3C;font-weight:700">${title}</div>
      <div style="font-size:12px;color:#64748B;margin-top:4px">Verification tier: ${tier}</div>
      ${feeNote}
    </div>
    <p style="font-size:13px;color:#94A3B8;text-align:center">Questions? Reply to this email - we are here to help.</p>
  </div>
  <div style="background:#1A2B3C;border-radius:0 0 20px 20px;padding:20px 40px;text-align:center">
    <div style="font-size:18px;font-weight:900"><span style="color:#02A95C">Every</span><span style="color:white">Giving</span></div>
    <div style="font-size:11px;color:rgba(255,255,255,.2);margin-top:4px">everygiving.org</div>
  </div>
</div></body></html>`
}

function adminAlertEmail(
  name: string, email: string, title: string, category: string,
  goal: number, tier: string, feeAmount: number, feeDeferred: boolean,
  idType: string, campaignId: string
): string {
  const rows: [string, string][] = [
    ['Campaign', title],
    ['Category', category],
    ['Goal', 'GH₵' + goal.toLocaleString()],
    ['Tier', tier],
    ['Fee', 'GH₵' + feeAmount + (feeDeferred ? ' (deferred)' : ' (paid upfront)')],
    ['ID type', idType || 'Not provided'],
    ['Fundraiser', name],
    ['Email', email],
    ['Campaign ID', campaignId],
  ]
  const rowsHtml = rows.map(([label, val]) =>
    `<tr>
      <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:12px;color:#64748B;width:120px;vertical-align:top">${label}</td>
      <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:13px;color:white;font-weight:600">${val}</td>
    </tr>`
  ).join('')

  return `<!DOCTYPE html><html><body style="margin:0;background:#0F172A;font-family:Arial,sans-serif">
<div style="max-width:540px;margin:32px auto;padding:0 16px">
  <div style="background:#1E293B;border-radius:20px;overflow:hidden">
    <div style="background:#02A95C;padding:20px 32px">
      <div style="color:white;font-size:18px;font-weight:900">New campaign to review</div>
      <div style="color:rgba(255,255,255,.7);font-size:12px;margin-top:2px">EveryGiving Admin - Action required</div>
    </div>
    <div style="padding:28px 32px">
      <table style="width:100%;border-collapse:collapse">${rowsHtml}</table>
      <div style="margin-top:24px;text-align:center">
        <a href="${APP_URL}/admin/campaigns" style="display:inline-block;background:#02A95C;color:white;font-weight:900;font-size:14px;padding:14px 32px;border-radius:100px;text-decoration:none">
          Review in Admin Panel
        </a>
      </div>
    </div>
  </div>
</div></body></html>`
}

// ─── Input helpers ───────────────────────────────────────────────────────────

function cleanStr(val: unknown, max: number): string {
  if (typeof val !== 'string') return ''
  return val.trim().slice(0, max)
}

function cleanNum(val: unknown, min: number, max: number): number | null {
  const n = parseFloat(String(val))
  if (isNaN(n) || n < min || n > max) return null
  return n
}

// ─── POST handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated. Please sign in and try again.' }, { status: 401 })
    }

    const body: Record<string, unknown> = await req.json()

    // Validate and sanitise core fields
    const title    = cleanStr(body.title, 120)
    const story    = cleanStr(body.story, 5000)
    const category = cleanStr(body.category, 50)
    const goal     = cleanNum(body.goal_amount, 100, 10000000)

    if (title.length < 5)  return NextResponse.json({ error: 'Campaign title must be at least 5 characters.' }, { status: 400 })
    if (story.length < 30) return NextResponse.json({ error: 'Campaign story must be at least 30 characters.' }, { status: 400 })
    if (!category)         return NextResponse.json({ error: 'Please select a category.' }, { status: 400 })
    if (goal === null)     return NextResponse.json({ error: 'Goal must be between GH₵100 and GH₵10,000,000.' }, { status: 400 })

    const tier        = cleanStr(body.tier, 20) || 'basic'
    const feeAmount   = parseFloat(String(body.fee_amount)) || 0
    const feeDeferred = body.fee_deferred === true
    const idType      = cleanStr(body.idType, 50)
    const idNumber    = cleanStr(body.idNumber, 50)
    const idFrontUrl  = cleanStr(body.idFrontUrl, 500)
    const selfieUrl   = cleanStr(body.selfieUrl, 500)

    // Insert core campaign row
    const { data: campaign, error: insertError } = await supabase
      .from('campaigns')
      .insert({
        user_id:      user.id,
        title,
        category,
        goal_amount:  goal,
        story,
        status:       'pending',
        raised_amount: 0,
        verified:     false,
      })
      .select()
      .single()

    if (insertError || !campaign) {
      console.error('Campaign insert error:', insertError)
      return NextResponse.json({ error: 'Could not save campaign. Please try again.' }, { status: 500 })
    }

    // Patch extra columns (silently skip any that do not exist in DB yet)
    const extras: Record<string, unknown> = {
      verification_tier: tier,
      id_type:           idType || null,
      id_number:         idNumber || null,
      id_front_url:      idFrontUrl || null,
      selfie_url:        selfieUrl || null,
      nia_verified:      false,
      verification_fee:  feeAmount,
      fee_deferred:      feeDeferred,
      fee_collected:     false,
    }

    const { error: patchErr } = await supabase.from('campaigns').update(extras).eq('id', campaign.id)
    if (patchErr) {
      // Fall back to column-by-column so we save whatever we can
      for (const [key, value] of Object.entries(extras)) {
        await supabase.from('campaigns').update({ [key]: value }).eq('id', campaign.id)
      }
    }

    // Update fundraiser profile
    const profileFields: Record<string, unknown> = {}
    const pf = (key: string, col: string) => { const v = cleanStr(body[key], 200); if (v) profileFields[col] = v }
    pf('fundraiserName',          'full_name')
    pf('fundraiserPhone',         'phone')
    pf('fundraiserWhatsapp',      'whatsapp')
    pf('fundraiserNetwork',       'mobile_network')
    pf('fundraiserPayoutMethod',  'payout_method')
    pf('fundraiserMomoNumber',    'momo_number')
    pf('fundraiserMomoNetwork',   'momo_network')
    pf('fundraiserBankName',      'bank_name')
    pf('fundraiserBankAccount',   'bank_account')
    pf('fundraiserAddress',       'address')
    pf('fundraiserLandmark',      'landmark')
    pf('fundraiserGpsAddress',    'gps_address')

    if (Object.keys(profileFields).length > 0) {
      await supabase.from('profiles').update(profileFields).eq('id', user.id)
    }

    // Send emails (non-blocking - do not await)
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
    const displayName = profile?.full_name || user.email?.split('@')[0] || 'Fundraiser'

    sendEmail(
      user.email!,
      `Campaign received - "${title}" is under review`,
      submittedEmail(displayName, title, tier, feeAmount, feeDeferred)
    )
    sendEmail(
      ADMIN_EMAIL,
      `New campaign: "${title}"`,
      adminAlertEmail(displayName, user.email!, title, category, goal, tier, feeAmount, feeDeferred, idType, campaign.id)
    )

    return NextResponse.json({ success: true, campaignId: campaign.id })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error. Please try again.'
    console.error('Campaign submit error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
