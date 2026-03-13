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
              await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sender: { name: 'EveryGiving', email: 'business@everygiving.org' },
                  to: [{ email: fundraiserEmail, name: fundraiserName }],
                  subject: body.status === 'approved'
                    ? `Your campaign "${campaign.title}" is live!`
                    : `Your campaign "${campaign.title}" — update from EveryGiving`,
                  htmlContent: `<p>Your campaign "${sanitiseString(campaign.title)}" has been ${body.status}.</p>${note ? `<p>Note: ${note}</p>` : ''}`,
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
