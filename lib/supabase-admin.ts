import { createClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client using the service role key.
 * Bypasses RLS — use only in protected admin API routes.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
