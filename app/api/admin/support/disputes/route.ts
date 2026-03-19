import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

// GET /api/admin/support/disputes
export async function GET() {
  const supabase = await getAdminClient()
  const { data, error } = await supabase
    .from('disputes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ disputes: data || [] })
}

// POST /api/admin/support/disputes — create dispute
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { reason, campaign_id, user_id } = body

  if (!reason?.trim()) {
    return NextResponse.json({ error: 'Reason is required' }, { status: 400 })
  }

  const supabase = await getAdminClient()
  const { data, error } = await supabase
    .from('disputes')
    .insert({ reason: reason.trim(), campaign_id: campaign_id || null, user_id: user_id || null, status: 'open' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ dispute: data })
}

// PATCH /api/admin/support/disputes — resolve dispute
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, resolution, status } = body

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = await getAdminClient()
  const { data, error } = await supabase
    .from('disputes')
    .update({ resolution, status: status || 'resolved', resolved_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ dispute: data })
}
