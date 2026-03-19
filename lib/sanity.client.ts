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

