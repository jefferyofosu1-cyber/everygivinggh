import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { requirePermission, logAdminAudit } from '@/lib/api-security'

export async function POST() {
  const auth = await requirePermission('payments.manage')
  if (auth.error) return auth.error

  const supabase = await getAdminClient()
  const startedAt = new Date().toISOString()

  const { data: events, error: eventError } = await supabase
    .from('payment_events')
    .select('id, status, processed')

  if (eventError) return NextResponse.json({ error: eventError.message }, { status: 500 })

  const list = events ?? []
  const mismatches = list.filter((e: any) => e.status === 'failed' || !e.processed).length

  const { data: run, error: runError } = await supabase
    .from('payment_reconciliation_runs')
    .insert({
      started_at: startedAt,
      finished_at: new Date().toISOString(),
      total_checked: list.length,
      mismatches,
      summary: { status: 'completed' },
    })
    .select('*')
    .single()

  if (runError) return NextResponse.json({ error: runError.message }, { status: 500 })

  await logAdminAudit({
    actorUserId: auth.user.id,
    action: 'payments.reconcile',
    entityType: 'payment_reconciliation_run',
    entityId: run.id,
    afterState: run,
  })

  return NextResponse.json({ run })
}
