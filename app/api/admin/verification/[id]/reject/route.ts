import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { requirePermission, logAdminAudit } from '@/lib/api-security'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requirePermission('verification.review')
  if (auth.error) return auth.error

  const body = await request.json().catch(() => ({}))
  const reason = body?.reason || null

  const supabase = await getAdminClient()
  const { data: before } = await supabase.from('verification_reviews').select('*').eq('id', params.id).maybeSingle()

  const { data, error } = await supabase
    .from('verification_reviews')
    .update({ status: 'rejected', notes: reason, reviewer_id: auth.user.id, reviewed_at: new Date().toISOString() })
    .eq('id', params.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAudit({ actorUserId: auth.user.id, action: 'verification.reject', entityType: 'verification_review', entityId: params.id, beforeState: before, afterState: data })
  return NextResponse.json({ review: data })
}
