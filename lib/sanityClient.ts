import { groq } from 'next-sanity'
import { sanityClient } from './sanity.client'
import { sanityWriteClient } from './sanity.server'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type CampaignStatus = 'pending' | 'verified' | 'active' | 'completed'
export type VerificationLevel = 'basic' | 'standard' | 'premium'

export interface CampaignInput {
  title: string
  slug?: string
  coverImage?: any
  category: string
  story: string
  goalAmount: number
  beneficiaryName: string
  beneficiaryPhone: string
  verificationLevel: VerificationLevel
  status: CampaignStatus
}

export interface Campaign extends CampaignInput {
  _id: string
  createdAt: string
  amountRaised: number
}

export interface DonationInput {
  donorName?: string | null
  donorEmail?: string | null
  amount: number
  campaignId: string
  message?: string | null
}

export interface Donation {
  _id: string
  donorName?: string | null
  donorEmail?: string | null
  amount: number
  message?: string | null
  createdAt: string
  campaignTitle?: string
}

export interface CategoryInput {
  name: string
  slug?: string
  icon: string
}

export interface Category {
  _id: string
  name: string
  slug: string
  icon: string
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function plainTextToPortableText(text: string) {
  const value = text.trim()
  if (!value) return []
  return [
    {
      _type: 'block',
      style: 'normal',
      children: [{ _type: 'span', text: value }],
    },
  ]
}

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

// ─── Campaigns ─────────────────────────────────────────────────────────────────

const campaignsListQuery = groq`*[_type == "campaign"] | order(createdAt desc){
  _id,
  title,
  "slug": slug.current,
  coverImage,
  story,
  category,
  goalAmount,
  amountRaised,
  beneficiaryName,
  beneficiaryPhone,
  verificationLevel,
  status,
  createdAt
}`

const campaignByIdQuery = groq`*[_type == "campaign" && _id == $id][0]{
  _id,
  title,
  "slug": slug.current,
  coverImage,
  story,
  category,
  goalAmount,
  amountRaised,
  beneficiaryName,
  beneficiaryPhone,
  verificationLevel,
  status,
  createdAt
}`

export async function getCampaigns(): Promise<Campaign[]> {
  return sanityClient.fetch(campaignsListQuery)
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  return sanityClient.fetch(campaignByIdQuery, { id })
}

export async function createCampaign(input: CampaignInput): Promise<Campaign> {
  const { story, slug, ...rest } = input

  const doc = await sanityWriteClient.create({
    _type: 'campaign',
    ...rest,
    amountRaised: 0,
    slug: { _type: 'slug', current: slug || toSlug(input.title) },
    story: plainTextToPortableText(story),
    createdAt: new Date().toISOString(),
  })

  return getCampaignById(doc._id) as Promise<Campaign>
}

export async function updateCampaign(
  id: string,
  input: Partial<CampaignInput>,
): Promise<Campaign> {
  const patch: Record<string, any> = {}

  if (input.title !== undefined) patch.title = input.title
  if (input.category !== undefined) patch.category = input.category
  if (input.goalAmount !== undefined) patch.goalAmount = input.goalAmount
  if (input.beneficiaryName !== undefined)
    patch.beneficiaryName = input.beneficiaryName
  if (input.beneficiaryPhone !== undefined)
    patch.beneficiaryPhone = input.beneficiaryPhone
  if (input.verificationLevel !== undefined)
    patch.verificationLevel = input.verificationLevel
  if (input.status !== undefined) patch.status = input.status
  if (input.coverImage !== undefined) patch.coverImage = input.coverImage
  if (input.story !== undefined)
    patch.story = plainTextToPortableText(input.story)
  if (input.slug !== undefined)
    patch.slug = { _type: 'slug', current: toSlug(input.slug) }

  await sanityWriteClient.patch(id).set(patch).commit()
  return getCampaignById(id) as Promise<Campaign>
}

export async function deleteCampaign(id: string): Promise<void> {
  await sanityWriteClient.delete(id)
}

// ─── Donations ─────────────────────────────────────────────────────────────────

const donationsListQuery = groq`*[_type == "donation"] | order(createdAt desc){
  _id,
  donorName,
  donorEmail,
  amount,
  message,
  createdAt,
  "campaignTitle": campaign->title
}`

export async function getDonations(): Promise<Donation[]> {
  return sanityClient.fetch(donationsListQuery)
}

export async function createDonation(
  input: DonationInput,
): Promise<Donation> {
  const { campaignId, ...rest } = input
  const doc = await sanityWriteClient.create({
    _type: 'donation',
    ...rest,
    campaign: {
      _type: 'reference',
      _ref: campaignId,
    },
    createdAt: new Date().toISOString(),
  })

  const created = await sanityClient.fetch(
    groq`*[_type == "donation" && _id == $id][0]{
      _id,
      donorName,
      donorEmail,
      amount,
      message,
      createdAt,
      "campaignTitle": campaign->title
    }`,
    { id: doc._id },
  )

  return created
}

// ─── Categories ────────────────────────────────────────────────────────────────

const categoriesListQuery = groq`*[_type == "category"] | order(name asc){
  _id,
  name,
  "slug": slug.current,
  icon
}`

export async function getCategories(): Promise<Category[]> {
  return sanityClient.fetch(categoriesListQuery)
}

export async function createCategory(
  input: CategoryInput,
): Promise<Category> {
  const { slug, ...rest } = input
  const doc = await sanityWriteClient.create({
    _type: 'category',
    ...rest,
    slug: { _type: 'slug', current: slug || toSlug(input.name) },
  })

  const created = await sanityClient.fetch(
    groq`*[_type == "category" && _id == $id][0]{
      _id,
      name,
      "slug": slug.current,
      icon
    }`,
    { id: doc._id },
  )

  return created
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>,
): Promise<Category> {
  const patch: Record<string, any> = {}

  if (input.name !== undefined) patch.name = input.name
  if (input.icon !== undefined) patch.icon = input.icon
  if (input.slug !== undefined || input.name !== undefined) {
    const base = input.slug || (input.name ?? '')
    patch.slug = { _type: 'slug', current: toSlug(base) }
  }

  await sanityWriteClient.patch(id).set(patch).commit()

  const updated = await sanityClient.fetch(
    groq`*[_type == "category" && _id == $id][0]{
      _id,
      name,
      "slug": slug.current,
      icon
    }`,
    { id },
  )

  return updated
}

