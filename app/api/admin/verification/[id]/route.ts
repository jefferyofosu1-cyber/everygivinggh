import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { requirePermission, logAdminAudit } from '@/lib/api-security'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requirePermission('verification.review')
  if (auth.error) return auth.error

  const body = await request.json()
  const updates = {
    notes: body?.notes,
    risk_score: body?.risk_score,
    reason_codes: body?.reason_codes,
  }

  const supabase = createAdminClient()
  const { data: before } = await supabase.from('verification_reviews').select('*').eq('id', params.id).maybeSingle()

  const { data, error } = await supabase
    .from('verification_reviews')
    .update(updates)
    .eq('id', params.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAudit({ actorUserId: auth.user.id, action: 'verification.update', entityType: 'verification_review', entityId: params.id, beforeState: before, afterState: data })
  return NextResponse.json({ review: data })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requirePermission('verification.review')
  if (auth.error) return auth.error

  const supabase = createAdminClient()
  const { data: before } = await supabase.from('verification_reviews').select('*').eq('id', params.id).maybeSingle()
  if (!before) return NextResponse.json({ error: 'Verification record not found' }, { status: 404 })

  const { error } = await supabase.from('verification_reviews').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAudit({ actorUserId: auth.user.id, action: 'verification.delete', entityType: 'verification_review', entityId: params.id, beforeState: before })
  return NextResponse.json({ deleted: true, id: params.id })
}
