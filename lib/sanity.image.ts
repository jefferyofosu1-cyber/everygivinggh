import imageUrlBuilder from '@sanity/image-url'
import { sanityClient } from './sanity.client'

type SanityImageSource = { asset?: { _ref?: string; _id?: string } } | string

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: SanityImageSource) {
  // If projectId is missing, return a dummy object that fails gracefully on .url()
  if (!sanityClient.config().projectId || sanityClient.config().projectId === 'missing') {
    return {
      width: () => ({ height: () => ({ fit: () => ({ url: () => '' }) }) }),
      url: () => '',
    } as any
  }
  return builder.image(source as any)
}

