import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const category = searchParams.get('category')

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    let supabase
    if (url && serviceRoleKey) {
      supabase = createClient(url, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    } else if (url && anonKey) {
      supabase = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    } else {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    // Get single post by slug
    if (slug) {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()

      if (error) {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
      }

      return NextResponse.json({ post: data })
    }

    // Get all published posts, optionally filtered by category
    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ posts: data || [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load blog posts'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
