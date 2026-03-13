import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { requirePermission, logAdminAudit } from '@/lib/api-security'

export async function GET(request: NextRequest) {
  const auth = await requirePermission('verification.review')
  if (auth.error) return auth.error

  const supabase = createAdminClient()
  const status = new URL(request.url).searchParams.get('status') || 'all'
  let query = supabase.from('verification_reviews').select('*').order('created_at', { ascending: false })

  if (status !== 'all') query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reviews: data ?? [] })
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission('verification.review')
  if (auth.error) return auth.error

  const body = await request.json()
  const campaignId = String(body?.campaign_id || '').trim()
  const notes = body?.notes ? String(body.notes).trim() : null
  const riskScore = typeof body?.risk_score === 'number' ? body.risk_score : null
  const reasonCodes = Array.isArray(body?.reason_codes)
    ? body.reason_codes.map((v: unknown) => String(v))
    : null

  if (!campaignId) return NextResponse.json({ error: 'campaign_id is required' }, { status: 400 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('verification_reviews')
    .insert({
      campaign_id: campaignId,
      status: 'pending',
      notes,
      risk_score: riskScore,
      reason_codes: reasonCodes,
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAudit({
    actorUserId: auth.user.id,
    action: 'verification.create',
    entityType: 'verification_review',
    entityId: data.id,
    afterState: data,
  })

  return NextResponse.json({ review: data }, { status: 201 })
}
