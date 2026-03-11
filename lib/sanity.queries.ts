import { groq } from 'next-sanity'

export const allCampaignsQuery = groq`*[_type == "campaign" && status in ["verified","active","completed"]] | order(createdAt desc) {
  _id,
  title,
  "slug": slug.current,
  coverImage,
  story,
  category,
  goalAmount,
  amountRaised,
  beneficiaryName,
  verificationLevel,
  status,
  createdAt
}`

export const featuredCampaignsQuery = groq`*[_type == "campaign" && status in ["verified","active"]] | order(createdAt desc)[0...6]{
  _id,
  title,
  "slug": slug.current,
  coverImage,
  category,
  goalAmount,
  amountRaised,
  verificationLevel,
  status
}`

export const campaignBySlugQuery = groq`*[_type == "campaign" && slug.current == $slug][0]{
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
  hospitalName,
  verificationLevel,
  status,
  createdAt
}`

export const campaignUpdatesBySlugQuery = groq`*[_type == "campaignUpdate" && campaign->slug.current == $slug] | order(createdAt desc){
  _id,
  updateTitle,
  updateBody,
  images,
  createdAt
}`

export const campaignDonationsBySlugQuery = groq`*[_type == "donation" && campaign->slug.current == $slug] | order(createdAt desc){
  _id,
  donorName,
  donorEmail,
  amount,
  message,
  createdAt
}`

export const categoriesQuery = groq`*[_type == "category"] | order(name asc){
  _id,
  name,
  "slug": slug.current,
  icon
}`

export const testimonialsQuery = groq`*[_type == "testimonial"] | order(_createdAt desc){
  _id,
  name,
  image,
  story,
  highlight
}`

export const faqsQuery = groq`*[_type == "faq"] | order(coalesce(order, 999), question asc){
  _id,
  question,
  answer
}`

