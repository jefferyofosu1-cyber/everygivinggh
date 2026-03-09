import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const BREVO_API_KEY = process.env.BREVO_API_KEY || ''
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jefferyofosu1@gmail.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://everygiving.org'

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!BREVO_API_KEY) { console.warn('No BREVO_API_KEY set'); return }
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
    console.error('Email send failed:', e)
  }
}

function confirmEmail(name: string, title: string, tier: string, feeAmount: number, feeDeferred: boolean) {
  return `<!DOCTYPE html><html><body style="margin:0;background:#F1F5F9;font-family:Arial,sans-serif">
<div style="max-width:580px;margin:32px auto;padding:0 16px">
  <div style="background:#1A2B3C;border-radius:20px 20px 0 0;padding:32px 40px;text-align:center">
    <div style="font-size:28px;font-weight:900"><span style="color:#02A95C">Every</span><span style="color:white">Giving</span></div>
    <div style="color:rgba(255,255,255,.4);font-size:11px;margin-top:4px;text-transform:uppercase;letter-spacing:.1em">Ghana's verified crowdfunding platform</div>
  </div>
  <div style="background:#02A95C;padding:24px 40px;text-align:center">
    <div style="font-size:32px;margin-bottom:8px">🎉</div>
    <div style="color:white;font-size:22px;font-weight:900">Campaign submitted, ${name}!</div>
  </div>
  <div style="background:white;padding:40px">
    <p style="font-size:15px;color:#475569;line-height:1.7;margin-bottom:24px">
      Your campaign <strong style="color:#1A2B3C">"${title}"</strong> has been received and is now <strong style="color:#02A95C">pending review</strong>. Our team usually reviews within 24 hours.
    </p>
    <div style="background:#F0FDF6;border:1.5px solid rgba(2,169,92,.2);border-radius:16px;padding:20px;margin-bottom:24px">
      <div style="font-size:12px;font-weight:800;color:#1A2B3C;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">What happens next</div>
      <div style="display:flex;gap:10px;margin-bottom:10px"><span>🔍</span><span style="font-size:13px;color:#475569">Our team reviews your campaign and identity documents</span></div>
      <div style="display:flex;gap:10px;margin-bottom:10px"><span>✅</span><span style="font-size:13px;color:#475569">Once approved, your campaign goes live and you get a confirmation email</span></div>
      <div style="display:flex;gap:10px"><span>📱</span><span style="font-size:13px;color:#475569">Share on WhatsApp to start receiving donations</span></div>
    </div>
    <div style="background:#F8FAFC;border-radius:12px;padding:16px;margin-bottom:24px">
      <div style="font-size:12px;color:#94A3B8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Campaign details</div>
      <div style="font-size:14px;color:#1A2B3C;font-weight:700">${title}</div>
      <div style="font-size:12px;color:#64748B;margin-top:4px">Verification tier: ${tier}</div>
      ${feeDeferred && feeAmount > 0 ? `<div style="font-size:12px;color:#D97706;margin-top:8px;padding:8px 12px;background:#FFFBEB;border-radius:8px;border:1px solid #FDE68A">💡 Your verification fee of ₵${feeAmount} will be deducted from your first donations — you pay nothing today.</div>` : ''}
    </div>
    <p style="font-size:13px;color:#94A3B8;text-align:center">Questions? Reply to this email — we are here to help.<br>
      <a href="${APP_URL}/help" style="color:#02A95C;text-decoration:none;font-weight:600">Visit Help Centre</a></p>
  </div>
  <div style="background:#1A2B3C;border-radius:0 0 20px 20px;padding:20px 40px;text-align:center">
    <div style="font-size:18px;font-weight:900"><span style="color:#02A95C">Every</span><span style="color:white">Giving</span></div>
    <div style="font-size:11px;color:rgba(255,255,255,.2);margin-top:4px">everygiving.org</div>
  </div>
</div></body></html>`
}

function adminAlertEmail(name: string, email: string, title: string, category: string, goal: string, tier: string, feeAmount: number, feeDeferred: boolean, idType: string, campaignId: string) {
  const rows = [
    ['Campaign', title], ['Category', category], ['Goal', '₵' + goal],
    ['Tier', tier], ['Fee', '₵' + feeAmount + (feeDeferred ? ' (deferred)' : ' (paid)')],
    ['ID type', idType], ['Fundraiser', name], ['Email', email], ['Campaign ID', campaignId],
  ]
  return `<!DOCTYPE html><html><body style="margin:0;background:#0F172A;font-family:Arial,sans-serif">
<div style="max-width:540px;margin:32px auto;padding:0 16px">
  <div style="background:#1E293B;border-radius:20px;overflow:hidden">
    <div style="background:#02A95C;padding:20px 32px">
      <div style="color:white;font-size:18px;font-weight:900">🚨 New campaign to review</div>
      <div style="color:rgba(255,255,255,.7);font-size:12px;margin-top:2px">EveryGiving Admin · Action required</div>
    </div>
    <div style="padding:28px 32px">
      <table style="width:100%;border-collapse:collapse">
        ${rows.map(([l, v]) => `<tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:12px;color:#64748B;width:120px;vertical-align:top">${l}</td><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:13px;color:white;font-weight:600">${v}</td></tr>`).join('')}
      </table>
      <div style="margin-top:24px;text-align:center">
        <a href="${APP_URL}/admin/campaigns" style="display:inline-block;background:#02A95C;color:white;font-weight:900;font-size:14px;padding:14px 32px;border-radius:100px;text-decoration:none">Review in Admin Panel →</a>
      </div>
    </div>
  </div>
</div></body></html>`
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated. Please sign in and try again.' }, { status: 401 })
    }

    const body = await req.json()
    const { title, category, goal_amount, story, tier, fee_amount, fee_deferred, idType, idNumber, idFrontUrl, selfieUrl } = body

    if (!title || !category || !goal_amount || !story) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const feeAmount = parseFloat(fee_amount) || 0
    const feeDeferred = fee_deferred === true

    // ── STEP 1: Insert with only the core columns that definitely exist ──
    // Extra columns (id_type, verification_tier, etc.) added via migration SQL
    const { data: campaign, error: insertError } = await supabase
      .from('campaigns')
      .insert({
        user_id: user.id,
        title: title.trim(),
        category,
        goal_amount: parseFloat(goal_amount) || 0,
        story: story.trim(),
        status: 'pending',
        raised_amount: 0,
        verified: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Campaign insert error:', insertError)
      return NextResponse.json({ error: 'Could not save campaign. Please try again.' }, { status: 500 })
    }

    // ── STEP 2: Patch extra columns one by one — silently skip any that don't exist yet ──
    const { fundraiserName, fundraiserPhone, fundraiserLocation, fundraiserRelationship } = body

    const extraColumns: Record<string, any> = {
      verification_tier: tier || 'basic',
      id_type: idType || null,
      id_number: idNumber || null,
      id_front_url: idFrontUrl || null,
      selfie_url: selfieUrl || null,
      nia_verified: false,
      verification_fee: feeAmount,
      fee_deferred: feeDeferred,
      fee_collected: false,
    }

    // Update profile with fundraiser contact details
    if (fundraiserName || fundraiserPhone) {
      const profileUpdate: Record<string, any> = {}
      if (fundraiserName) profileUpdate.full_name = fundraiserName
      if (fundraiserPhone) profileUpdate.phone = fundraiserPhone
      if (fundraiserLocation) profileUpdate.location = fundraiserLocation
      await supabase.from('profiles').update(profileUpdate).eq('id', user.id)
    }

    // Try patching all extra columns together first
    const { error: patchError } = await supabase
      .from('campaigns')
      .update(extraColumns)
      .eq('id', campaign.id)

    if (patchError) {
      // If that fails, try each column individually so we save whatever we can
      console.warn('Bulk patch failed, trying individually:', patchError.message)
      for (const [key, value] of Object.entries(extraColumns)) {
        const { error: colError } = await supabase
          .from('campaigns')
          .update({ [key]: value })
          .eq('id', campaign.id)
        if (colError) {
          console.warn(`Column ${key} not yet in DB — skipping:`, colError.message)
        }
      }
    }

    // ── STEP 3: Send emails (non-blocking) ──
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
    const name = profile?.full_name || user.email?.split('@')[0] || 'Fundraiser'

    sendEmail({ to: user.email!, subject: `Campaign received — "${title}" is under review`, html: confirmEmail(name, title, tier || 'Basic', feeAmount, feeDeferred) })
    sendEmail({ to: ADMIN_EMAIL, subject: `🚨 New campaign: "${title}"`, html: adminAlertEmail(name, user.email!, title, category, goal_amount, tier || 'Basic', feeAmount, feeDeferred, idType || 'Unknown', campaign.id) })

    return NextResponse.json({ success: true, campaignId: campaign.id })

  } catch (err: any) {
    console.error('Unexpected submit error:', err)
    return NextResponse.json({ error: err.message || 'Unexpected error. Please try again.' }, { status: 500 })
  }
}
