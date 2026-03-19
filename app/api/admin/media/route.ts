import { NextRequest, NextResponse } from 'next/server'
import { sanityWriteClient, sanityClient } from '@/lib/sanity'
import { requirePermission, logAdminAudit } from '@/lib/api-security'

// GET — list all uploaded images from Sanity
export async function GET(request: NextRequest) {
  const auth = await requirePermission('media.review')
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const tag = searchParams.get('tag') || ''
  const offset = parseInt(searchParams.get('offset') || '0', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)

  const filter = tag
    ? `_type == "media.image" && $tag in tags`
    : `_type == "media.image"`

  const params: Record<string, unknown> = tag ? { tag } : {}

  const [images, total] = await Promise.all([
    sanityClient.fetch(
      `*[${filter}] | order(_createdAt desc) [${offset}...${offset + limit}] {
        _id, _createdAt, title, tags, alt,
        "url": image.asset->url,
        "metadata": image.asset->metadata { dimensions, lqip }
      }`,
      params,
    ),
    sanityClient.fetch(`count(*[${filter}])`, params),
  ])

  return NextResponse.json({ images, total, offset, limit })
}

// POST — upload a new image to Sanity (admin only)
export async function POST(request: NextRequest) {
  const auth = await requirePermission('media.manage')
  if (auth.error) return auth.error

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const title = (formData.get('title') as string) || ''
  const alt = (formData.get('alt') as string) || ''
  const tags = (formData.get('tags') as string) || ''

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Validate file type
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 })
  }

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Upload asset to Sanity
  const asset = await sanityWriteClient.assets.upload('image', buffer, {
    filename: file.name,
    contentType: file.type,
  })

  // Create a media.image document referencing the asset
  const doc = await sanityWriteClient.create({
    _type: 'media.image',
    title: title || file.name.replace(/\.[^.]+$/, ''),
    alt: alt || '',
    tags: tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    image: {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
    },
  })

  await logAdminAudit({
    actorUserId: auth.user.id,
    action: 'media.upload',
    entityType: 'media.image',
    entityId: doc._id,
    afterState: { title: doc.title, tags: doc.tags },
  })

  return NextResponse.json({
    _id: doc._id,
    url: asset.url,
    title: doc.title,
    alt: doc.alt,
    tags: doc.tags,
  })
}
