import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, sanitiseString, sanitiseNumber, logAdminAudit } from '@/lib/api-security'
import { getAdminClient } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const auth = await requirePermission('campaigns.review')
  if (auth.error) return auth.error

  const supabase = await getAdminClient()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  let q = supabase.from('campaigns')
    .select('*, profiles(full_name, phone, email), user_id')
    .order('created_at', { ascending: false })
  if (status && status !== 'all') q = q.eq('status', status)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ campaigns: data ?? [] })
}

// PATCH — update status (approve/reject) OR edit campaign fields, or assign/remove image
export async function PATCH(req: NextRequest) {
  const auth = await requirePermission('campaigns.review')
  if (auth.error) return auth.error

  try {
    const body = await req.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing campaign id' }, { status: 400 })
    }

    const supabase = await getAdminClient()

    // --- Status change flow (approve / reject) ---
    if (body.status && (body.status === 'approved' || body.status === 'rejected')) {
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({ status: body.status, verified: body.status === 'approved' })
        .eq('id', id)

      if (updateError) {
        console.error('Campaign update error:', updateError)
        return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
      }

      // Look up fundraiser email to send notification
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('title, user_id, profiles(full_name, email)')
        .eq('id', id)
        .single()

      if (campaign) {
        const profile = campaign.profiles as any
        const fundraiserEmail = profile?.email
        const fundraiserName = profile?.full_name?.split(' ')[0] || 'there'
        const note = body.note ? sanitiseString(body.note) : ''

        if (fundraiserEmail) {
          const BREVO_API_KEY = process.env.BREVO_API_KEY || ''
          if (BREVO_API_KEY) {
          try {
              const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://everygiving.org'
              const isApproved = body.status === 'approved'
              const emailSubject = isApproved
                ? `Your campaign "${campaign.title}" is live!`
                : `Your campaign "${campaign.title}" — update from EveryGiving`

              const emailHtml = isApproved
                ? `<!DOCTYPE html><html><body style="margin:0;background:#F1F5F9;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:580px;margin:32px auto;padding:0 16px;">
  <div style="background:#1A2B3C;border-radius:20px 20px 0 0;padding:32px 40px;text-align:center;">
    <div style="font-size:28px;font-weight:900;"><span style="color:#02A95C;">Every</span><span style="color:white;">Giving</span></div>
  </div>
  <div style="background:#02A95C;padding:28px 40px;text-align:center;">
    <div style="color:white;font-size:24px;font-weight:900;">Your campaign is live, ${fundraiserName}!</div>
  </div>
  <div style="background:white;padding:40px;">
    <p style="font-size:15px;color:#475569;line-height:1.7;margin-bottom:24px;">
      Great news — your campaign <strong style="color:#1A2B3C;">"${campaign.title}"</strong> has been <strong style="color:#02A95C;">approved</strong> and is now live on EveryGiving.
    </p>
    ${note ? `<div style="background:#F8FAFC;border-radius:12px;padding:16px;margin-bottom:24px;"><div style="font-size:12px;color:#94A3B8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">Note from our team</div><div style="font-size:14px;color:#475569;">${note}</div></div>` : ''}
    <div style="text-align:center;margin:28px 0;">
      <a href="${APP_URL}/campaigns" style="display:inline-block;background:#02A95C;color:white;font-weight:900;font-size:15px;padding:16px 44px;border-radius:9999px;text-decoration:none;">View your campaign</a>
    </div>
  </div>
  <div style="background:#1A2B3C;border-radius:0 0 20px 20px;padding:20px 40px;text-align:center;">
    <div style="font-size:18px;font-weight:900;"><span style="color:#02A95C;">Every</span><span style="color:white;">Giving</span></div>
  </div>
</div></body></html>`
                : `<!DOCTYPE html><html><body style="margin:0;background:#F1F5F9;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:580px;margin:32px auto;padding:0 16px;">
  <div style="background:#1A2B3C;border-radius:20px 20px 0 0;padding:32px 40px;text-align:center;">
    <div style="font-size:28px;font-weight:900;"><span style="color:#02A95C;">Every</span><span style="color:white;">Giving</span></div>
  </div>
  <div style="background:#EF4444;padding:28px 40px;text-align:center;">
    <div style="color:white;font-size:22px;font-weight:900;">Campaign not approved — ${fundraiserName}</div>
  </div>
  <div style="background:white;padding:40px;">
    <p style="font-size:15px;color:#475569;line-height:1.7;margin-bottom:24px;">
      We reviewed your campaign <strong style="color:#1A2B3C;">"${campaign.title}"</strong> and unfortunately we were not able to approve it at this time.
    </p>
    <div style="background:#FEF2F2;border:1.5px solid rgba(239,68,68,0.2);border-radius:16px;padding:20px;margin-bottom:24px;">
      <div style="font-size:12px;font-weight:800;color:#1A2B3C;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Reason</div>
      <div style="font-size:14px;color:#475569;line-height:1.6;">${note || 'Please contact us at business@everygiving.org for more details.'}</div>
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="mailto:business@everygiving.org" style="display:inline-block;background:#1A2B3C;color:white;font-weight:900;font-size:14px;padding:14px 36px;border-radius:9999px;text-decoration:none;">Reply to appeal</a>
    </div>
  </div>
  <div style="background:#1A2B3C;border-radius:0 0 20px 20px;padding:20px 40px;text-align:center;">
    <div style="font-size:18px;font-weight:900;"><span style="color:#02A95C;">Every</span><span style="color:white;">Giving</span></div>
  </div>
</div></body></html>`

              await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sender: { name: 'EveryGiving', email: 'business@everygiving.org' },
                  to: [{ email: fundraiserEmail, name: fundraiserName }],
                  subject: emailSubject,
                  htmlContent: emailHtml,
                }),
              })
            } catch (e) {
              console.error('Status email failed:', e)
            }
          }
        }
      }

      await logAdminAudit({
        actorUserId: auth.user.id,
        action: `campaign.status.${body.status}`,
        entityType: 'campaign',
        entityId: id,
        afterState: { status: body.status },
      })

      return NextResponse.json({ success: true })
    }

    // --- Field edit flow ---
    const allowedFields = ['title', 'story', 'category', 'goal_amount', 'verification_tier', 'deadline', 'location', 'image_url']
    const updates: Record<string, any> = {}

    for (const key of allowedFields) {
      if (key in body) {
        if (key === 'goal_amount') {
          const v = sanitiseNumber(body[key], 1, 999999)
          if (v === null) return NextResponse.json({ error: 'Invalid goal amount' }, { status: 400 })
          updates[key] = v
        } else if (key === 'image_url') {
          // Allow null to clear the image
          updates[key] = body[key] === null ? null : sanitiseString(body[key], 2048)
        } else {
          updates[key] = sanitiseString(body[key], key === 'story' ? 5000 : 500)
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)

    if (updateError) {
      console.error('Campaign edit error:', updateError)
      return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
    }

    await logAdminAudit({
      actorUserId: auth.user.id,
      action: 'campaign.update',
      entityType: 'campaign',
      entityId: id,
      afterState: updates,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Admin campaign update error:', err)
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 })
  }
}

// DELETE — remove a campaign
export async function DELETE(req: NextRequest) {
  const auth = await requirePermission('campaigns.review')
  if (auth.error) return auth.error

  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing campaign id' }, { status: 400 })

    const supabase = await getAdminClient()

    // Delete related donations first
    await supabase.from('donations').delete().eq('campaign_id', id)

    const { error } = await supabase.from('campaigns').delete().eq('id', id)
    if (error) {
      console.error('Campaign delete error:', error)
      return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 })
    }

    await logAdminAudit({
      actorUserId: auth.user.id,
      action: 'campaign.delete',
      entityType: 'campaign',
      entityId: id,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Admin campaign delete error:', err)
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 })
  }
}
