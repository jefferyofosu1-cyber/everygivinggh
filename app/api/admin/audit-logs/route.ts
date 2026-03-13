import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { requirePermission } from '@/lib/api-security'

export async function GET(request: NextRequest) {
  const auth = await requirePermission('reports.read')
  if (auth.error) return auth.error

  const supabase = createAdminClient()
  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 500)

  const { data, error } = await supabase
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ logs: data ?? [] })
}
