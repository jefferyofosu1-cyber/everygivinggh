import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { requirePermission, logAdminAudit } from '@/lib/api-security'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requirePermission('support.manage')
  if (auth.error) return auth.error

  const body = await request.json()
  const supabase = await getAdminClient()

  const { data: before } = await supabase.from('support_tickets').select('*').eq('id', params.id).maybeSingle()
  const { data, error } = await supabase
    .from('support_tickets')
    .update({
      status: body?.status,
      priority: body?.priority,
      assigned_to: body?.assigned_to,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAudit({ actorUserId: auth.user.id, action: 'support.ticket_update', entityType: 'support_ticket', entityId: params.id, beforeState: before, afterState: data })
  return NextResponse.json({ ticket: data })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requirePermission('support.manage')
  if (auth.error) return auth.error

  const supabase = await getAdminClient()
  const { data: before } = await supabase.from('support_tickets').select('*').eq('id', params.id).maybeSingle()
  if (!before) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

  const { error } = await supabase.from('support_tickets').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAudit({ actorUserId: auth.user.id, action: 'support.ticket_delete', entityType: 'support_ticket', entityId: params.id, beforeState: before })
  return NextResponse.json({ deleted: true, id: params.id })
}
