// ─── Shared constants ────────────────────────────────────────────────────────

// ─── FEES ───────────────────────────────────────────────────────────────────
export const FEE_RATE = 0.025          // 2.5% of donation
export const FEE_FLAT = 0.50           // ₵0.50 per donation
export const PLATFORM_FEE = 0          // No platform fee charged to campaigners

export function calcFee(donationGHS: number): number {
  return donationGHS * FEE_RATE + FEE_FLAT
}

export function calcCampaignFees(goalGHS: number, avgDonationGHS = 100): number {
  const numDonations = goalGHS / avgDonationGHS
  return numDonations * calcFee(avgDonationGHS)
}

export const FEE_DISPLAY_RULES = {
  donorFlow:           false,  // NEVER show fees to donors during giving
  campaignCard:        false,  // NEVER show fee on campaign cards
  campaignDetailPage:  false,  // NEVER show fee on campaign page
  feesPage:            true,   // Always show on /fees page
  campaignerDashboard: true,   // Show in payout section
  createFlowStep6:     true,   // Show in payout step during campaign creation
}

// ─── IMAGES (Unsplash) ───────────────────────────────────────────────────────
export const IMAGES = {
  hero: {
    main:       'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=1400&q=80&auto=format&fit=crop',
    mobile:     'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&q=80&auto=format&fit=crop',
    secondary:  'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80&auto=format&fit=crop',
  },
  categories: {
    medical: {
      card: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&q=70&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80&auto=format&fit=crop',
    },
    education: {
      card: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=70&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80&auto=format&fit=crop',
    },
    emergency: {
      card: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=400&q=70&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=1200&q=80&auto=format&fit=crop',
    },
    faith: {
      card: 'https://images.unsplash.com/photo-1545987796-200677ee1011?w=400&q=70&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1545987796-200677ee1011?w=1200&q=80&auto=format&fit=crop',
    },
    community: {
      card: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&q=70&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&q=80&auto=format&fit=crop',
    },
    memorial: {
      card: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&q=70&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1200&q=80&auto=format&fit=crop',
    },
    environment: {
      card: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=70&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80&auto=format&fit=crop',
    },
    business: {
      card: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&q=70&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=80&auto=format&fit=crop',
    },
    family: {
      card: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&q=70&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=1200&q=80&auto=format&fit=crop',
    },
    sports: {
      card: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=70&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&q=80&auto=format&fit=crop',
    },
    events: {
      card: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=70&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80&auto=format&fit=crop',
    },
    wishes: {
      card: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=70&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1200&q=80&auto=format&fit=crop',
    },
    competition: {
      card: 'https://images.unsplash.com/photo-1567057419565-4349c49d8a04?w=400&q=70&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1567057419565-4349c49d8a04?w=1200&q=80&auto=format&fit=crop',
    },
    travel: {
      card: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=70&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80&auto=format&fit=crop',
    },
    volunteer: {
      card: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&q=70&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80&auto=format&fit=crop',
    },
    diaspora: {
      card: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=70&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80&auto=format&fit=crop',
    },
    other: {
      card: 'https://images.unsplash.com/photo-1536037600853-a9d0e014f4dd?w=400&q=70&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1536037600853-a9d0e014f4dd?w=1200&q=80&auto=format&fit=crop',
    },
  },
  howItWorks: {
    createCampaign:    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&q=80&auto=format&fit=crop',
    verifyId:          'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=600&q=80&auto=format&fit=crop',
    shareAndReceive:   'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80&auto=format&fit=crop',
  },
  about: {
    team:      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80&auto=format&fit=crop',
    accra:     'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=1000&q=80&auto=format&fit=crop',
    community: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80&auto=format&fit=crop',
  },
}

export const CATEGORIES = [
  'All', 'Medical', 'Education', 'Church & Faith', 'Emergency',
  'Business', 'Memorial', 'Community', 'Events',
] as const

export const EMOJI: Record<string, string> = {
  medical: '🏥', Medical: '🏥',
  emergency: '🆘', Emergency: '🆘',
  education: '🎓', Education: '🎓',
  charity: '🤲',
  faith: '⛪', 'Church & Faith': '⛪',
  community: '🏘', Community: '🏘',
  environment: '🌿',
  business: '💼', Business: '💼',
  family: '👨‍👩‍👧',
  sports: '⚽',
  events: '🎉', Events: '🎉',
  wishes: '🌟',
  competition: '🏆',
  travel: '✈️',
  volunteer: '🙌',
  memorial: '🕊', Memorial: '🕊',
  other: '💚', Other: '💚',
}

export const CATEGORY_COLORS: Record<string, string> = {
  medical: 'bg-green-50',
  education: 'bg-blue-50',
  church: 'bg-indigo-50',
  'church & faith': 'bg-indigo-50',
  emergency: 'bg-red-50',
  business: 'bg-amber-50',
  community: 'bg-purple-50',
  memorial: 'bg-gray-50',
  events: 'bg-pink-50',
}

export const CATEGORY_GRADIENTS: Record<string, string> = {
  medical: 'from-red-50 to-rose-100',
  emergency: 'from-orange-50 to-amber-100',
  education: 'from-blue-50 to-indigo-100',
  faith: 'from-purple-50 to-violet-100',
  'church & faith': 'from-purple-50 to-violet-100',
  community: 'from-green-50 to-emerald-100',
  family: 'from-pink-50 to-rose-100',
  sports: 'from-yellow-50 to-amber-100',
  default: 'from-primary-light to-blue-50',
}

export function getEmoji(category: string): string {
  return EMOJI[category] || EMOJI[category?.toLowerCase()] || '💚'
}

export function getCategoryGradient(category: string): string {
  return CATEGORY_GRADIENTS[category?.toLowerCase()] || CATEGORY_GRADIENTS.default
}
