import { createClient } from 'next-sanity'

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-03-01',
  useCdn: true,
})

export async function getBlogPosts() {
  return sanityClient.fetch(`
    *[_type == "blogPost"] | order(publishedAt desc) {
      title, slug, excerpt, category, publishedAt, featured,
      "coverUrl": coverImage.asset->url
    }
  `)
}

export async function getBlogPost(slug: string) {
  return sanityClient.fetch(`
    *[_type == "blogPost" && slug.current == $slug][0] {
      title, excerpt, category, publishedAt, body,
      "coverUrl": coverImage.asset->url
    }
  `, { slug })
}
