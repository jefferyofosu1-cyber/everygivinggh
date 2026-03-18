import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PUBLIC_STATUSES = new Set(['approved', 'active', 'live'])

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Use service role first to bypass RLS
    let supabase
    if (url && serviceRoleKey) {
      supabase = createClient(url, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    } else if (url && anonKey) {
      // Fall back to anon key for public data
      supabase = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    } else {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

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
