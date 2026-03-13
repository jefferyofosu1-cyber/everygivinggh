import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { requirePermission } from '@/lib/api-security'

export async function GET() {
  const auth = await requirePermission('reports.read')
  if (auth.error) return auth.error

  const supabase = await getAdminClient()
  const { data, error } = await supabase
    .from('campaigns')
    .select('category, goal_amount, raised_amount')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const map = new Map<string, { count: number; goal: number; raised: number }>()
  for (const row of data ?? []) {
    const key = row.category || 'uncategorized'
    const prev = map.get(key) || { count: 0, goal: 0, raised: 0 }
    prev.count += 1
    prev.goal += Number((row as any).goal_amount || 0)
    prev.raised += Number((row as any).raised_amount || 0)
    map.set(key, prev)
  }

  const categories = Array.from(map.entries()).map(([category, stats]) => ({ category, ...stats }))
  return NextResponse.json({ categories })
}
