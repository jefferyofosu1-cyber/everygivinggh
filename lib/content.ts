import { sanityClient } from '@/lib/sanity'
import { useEffect, useState } from 'react'

/**
 * Server-side: fetch page content from Sanity by slug.
 */
export async function getPageContent(slug: string): Promise<Record<string, any> | null> {
  try {
    const doc = await sanityClient.fetch(
      `*[_type == "pageContent" && slug == $slug][0]{ sections }`,
      { slug }
    )
    return doc?.sections ?? null
  } catch {
    return null
  }
}

/**
 * Client-side hook: fetch page content via API.
 * Returns sections object (empty {} while loading or if no content).
 */
export function usePageContent(slug: string): Record<string, any> {
  const [sections, setSections] = useState<Record<string, any>>({})

  useEffect(() => {
    fetch(`/api/admin/content?page=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(data => {
        if (data.content?.sections) setSections(data.content.sections)
      })
      .catch(() => {})
  }, [slug])

  return sections
}

/** Helper: get a value from CMS sections or fall back to default. */
export function cms<T>(sections: Record<string, any>, sectionKey: string, fieldKey: string, fallback: T): T {
  return sections?.[sectionKey]?.[fieldKey] ?? fallback
}
