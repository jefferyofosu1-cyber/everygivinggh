// ─── Shared constants ────────────────────────────────────────────────────────

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
