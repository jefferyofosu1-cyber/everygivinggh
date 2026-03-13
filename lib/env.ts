// Validates that critical environment variables are set at startup.
// Import this in layout.tsx or next.config.js to fail fast.

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

const optional = [
  'NEXT_PUBLIC_APP_URL',
  'BREVO_API_KEY',
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'NEXT_PUBLIC_SANITY_DATASET',
  'SANITY_API_TOKEN',
  'SMILE_PARTNER_ID',
  'SMILE_API_KEY',
  'SMILE_BASE_URL',
] as const

export function validateEnv() {
  const missing = required.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n  ${missing.join('\n  ')}\n\nSee .env.example for reference.`
    )
  }

  const unset = optional.filter((key) => !process.env[key])
  if (unset.length > 0) {
    console.warn(`[env] Optional env vars not set: ${unset.join(', ')}`)
  }
}
