import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { requirePermission, logAdminAudit } from '@/lib/api-security'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requirePermission('disputes.manage')
  if (auth.error) return auth.error

  const body = await request.json()
  const supabase = createAdminClient()

  const { data: before } = await supabase.from('donation_disputes').select('*').eq('id', params.id).maybeSingle()
  const { data, error } = await supabase
    .from('donation_disputes')
    .update({
      status: body?.status,
      resolution: body?.resolution,
      resolved_at: body?.status === 'resolved' ? new Date().toISOString() : null,
    })
    .eq('id', params.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAudit({ actorUserId: auth.user.id, action: 'support.dispute_update', entityType: 'donation_dispute', entityId: params.id, beforeState: before, afterState: data })
  return NextResponse.json({ dispute: data })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requirePermission('disputes.manage')
  if (auth.error) return auth.error

  const supabase = createAdminClient()
  const { data: before } = await supabase.from('donation_disputes').select('*').eq('id', params.id).maybeSingle()
  if (!before) return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })

  const { error } = await supabase.from('donation_disputes').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAudit({ actorUserId: auth.user.id, action: 'support.dispute_delete', entityType: 'donation_dispute', entityId: params.id, beforeState: before })
  return NextResponse.json({ deleted: true, id: params.id })
}
