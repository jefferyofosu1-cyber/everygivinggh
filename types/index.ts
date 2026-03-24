export type Campaign = {
  id: string
  user_id: string
  title: string
  story: string
  category: string
  goal_amount: number
  raised_amount: number
  image_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  verification_tier: 'basic' | 'standard' | 'premium'
  verified: boolean
  deadline: string | null
  location: string | null
  id_type: string | null
  id_number: string | null
  id_front_url: string | null
  selfie_url: string | null
  created_at: string
  last_update_at?: string | null
  slug?: string
  videoUrl?: string | null
  gallery?: any[]
  payout_ready?: boolean
  payout_method_set?: boolean
  milestone_reached?: boolean
  donor_count?: number
  profiles?: { full_name: string; phone: string; email?: string }
  donations?: Donation[]
}

export type Donation = {
  id: string
  campaign_id: string
  donor_name: string
  donor_email: string
  amount: number
  amount_paid: number
  message: string | null
  payment_method: string
  payment_reference: string | null
  status: 'pending' | 'success' | 'failed'
  created_at: string
}

export type Profile = {
  id: string
  full_name: string
  phone: string
  email: string | null
  avatar_url: string | null
  is_admin: boolean
  created_at: string
}

export type VerificationDoc = {
  id: string
  campaign_id: string
  doc_type: string
  doc_url: string
  verified: boolean
  created_at: string
}
