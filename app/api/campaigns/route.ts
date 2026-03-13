import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const PUBLIC_STATUSES = new Set(['approved', 'active', 'live'])

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Prefer service role so public listing is not blocked by strict RLS.
    if (url && serviceRoleKey) {
      const admin = createClient(url, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })

      const { data, error } = await admin
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const campaigns = (data ?? []).filter((campaign) =>
        PUBLIC_STATUSES.has(String(campaign.status ?? '').toLowerCase())
      )

      return NextResponse.json({ campaigns })
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const campaigns = (data ?? []).filter((campaign) =>
      PUBLIC_STATUSES.has(String(campaign.status ?? '').toLowerCase())
    )

    return NextResponse.json({ campaigns })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load campaigns'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
