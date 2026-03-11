import { NextResponse } from 'next/server'
import { sanityWriteClient } from '@/lib/sanity.server'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      title,
      slug,
      story,
      category,
      goalAmount,
      beneficiaryName,
      beneficiaryPhone,
      hospitalName,
      verificationLevel,
    } = body

    if (!title || !story || !category || !goalAmount || !beneficiaryName || !beneficiaryPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      )
    }

    const doc = {
      _type: 'campaign',
      title,
      slug: { _type: 'slug', current: slug || title.toLowerCase().replace(/\s+/g, '-').slice(0, 96) },
      story: [
        {
          _type: 'block',
          style: 'normal',
          children: [{ _type: 'span', text: story }],
        },
      ],
      category,
      goalAmount: Number(goalAmount),
      amountRaised: 0,
      beneficiaryName,
      beneficiaryPhone,
      hospitalName: hospitalName || null,
      verificationLevel: verificationLevel || 'basic',
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    const created = await sanityWriteClient.create(doc)

    return NextResponse.json({ id: created._id }, { status: 201 })
  } catch (error) {
    console.error('Sanity create campaign error', error)
    return NextResponse.json(
      { error: 'Failed to create campaign in CMS' },
      { status: 500 },
    )
  }
}

