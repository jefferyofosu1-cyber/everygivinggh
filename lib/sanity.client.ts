import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

if (!projectId) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID for Sanity client. Sanity features will not work.')
}

export const sanityClient = createClient({
  projectId: projectId || 'missing',
  dataset,
  apiVersion: '2025-01-01',
  useCdn: process.env.NODE_ENV === 'production',
})

/**
 * High-performance, safe fetch that never crashes the server component.
 * Returns null if the fetch fails or Sanity is misconfigured.
 */
export async function safeSanityFetch<T>(query: string, params: Record<string, any> = {}): Promise<T | null> {
  if (!projectId || projectId === 'missing') return null
  try {
    return await sanityClient.fetch<T>(query, params)
  } catch (err) {
    console.error('[Sanity] Fetch failed:', err)
    return null
  }
}

