import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    let supabase
    // Use service role if available to bypass RLS and get all public campaigns
    if (url && serviceRoleKey) {
      supabase = createClient(url, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .in('status', ['approved', 'active', 'live'])
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ campaigns: data || [] })
    } else if (url && anonKey) {
      // Fall back to anon key - relies on RLS policies
      supabase = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Campaign query error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ campaigns: data || [] })
    } else {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load campaigns'
    console.error('Campaigns endpoint error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
