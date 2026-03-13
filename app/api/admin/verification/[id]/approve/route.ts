import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { requirePermission, logAdminAudit } from '@/lib/api-security'

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requirePermission('verification.review')
  if (auth.error) return auth.error

  const supabase = createAdminClient()
  const { data: before } = await supabase.from('verification_reviews').select('*').eq('id', params.id).maybeSingle()

  const { data, error } = await supabase
    .from('verification_reviews')
    .update({ status: 'approved', reviewer_id: auth.user.id, reviewed_at: new Date().toISOString() })
    .eq('id', params.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAudit({ actorUserId: auth.user.id, action: 'verification.approve', entityType: 'verification_review', entityId: params.id, beforeState: before, afterState: data })
  return NextResponse.json({ review: data })
}
