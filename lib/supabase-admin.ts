import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from './supabase-server'

/**
 * Server-only Supabase client using the service role key.
 * Bypasses RLS — use only in protected admin API routes.
 * Returns null if service role key is not configured.
 */
export function createServiceRoleClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) return null

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * Returns a Supabase client for admin queries.
 * Uses the user's session first; falls back to service role key if available.
 */
export async function getAdminClient(): Promise<SupabaseClient> {
  // Prefer service role key (bypasses RLS, needed for admin to see all data)
  const serviceClient = createServiceRoleClient()
  if (serviceClient) return serviceClient

  // Fallback: user's authenticated session
  return createServerSupabaseClient()
}

/** @deprecated Use getAdminClient() instead */
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
