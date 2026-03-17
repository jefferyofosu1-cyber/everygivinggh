import imageUrlBuilder from '@sanity/image-url'
import { sanityClient } from './sanity.client'

type SanityImageSource = { asset?: { _ref?: string; _id?: string } } | string

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: SanityImageSource) {
  return builder.image(source as any)
}

