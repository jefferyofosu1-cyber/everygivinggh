type DonationCardProps = {
  donorName?: string | null
  amount: number
  message?: string | null
  createdAt: string
}

function daysAgo(dateStr: string): string {
  if (!dateStr) return 'Recently'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Recently'
  
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000)
  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays} days ago`
}

export function DonationCard({
  donorName,
  amount,
  message,
  createdAt,
}: DonationCardProps) {
  const name = donorName || 'Anonymous'

  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-light to-blue-100 flex items-center justify-center text-sm font-bold text-primary border border-primary/10">
        {name === 'Anonymous' ? '👤' : name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="font-nunito font-black text-navy text-sm">
            {name}
          </span>
          <span className="font-nunito font-black text-primary text-sm whitespace-nowrap">
            ₵{(amount || 0).toLocaleString()}
          </span>
        </div>
        {message && (
          <p className="text-gray-500 text-xs leading-relaxed mb-1 italic">
            "{message}"
          </p>
        )}
        <div className="text-xs text-gray-300">{daysAgo(createdAt)}</div>
      </div>
    </div>
  )
}

