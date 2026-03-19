import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    let supabase
    // Use service role if available to bypass RLS and get campaign
    if (url && serviceRoleKey) {
      supabase = createClient(url, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Campaign fetch error:', error.message)
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        )
      }

      if (!data) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ campaign: data })
    } else if (url && anonKey) {
      // Fall back to anon key - relies on RLS policies
      supabase = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Campaign fetch error:', error.message)
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        )
      }

      if (!data) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ campaign: data })
    } else {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load campaign'
    console.error('Campaign endpoint error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
