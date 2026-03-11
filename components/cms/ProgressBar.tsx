type Props = {
  goalAmount: number
  amountRaised: number
}

export function ProgressBar({ goalAmount, amountRaised }: Props) {
  const pct = goalAmount
    ? Math.min(Math.round((amountRaised / goalAmount) * 100), 100)
    : 0

  return (
    <div className="space-y-1.5">
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          <span className="font-bold text-navy">
            ₵{(amountRaised || 0).toLocaleString()}
          </span>{' '}
          raised
        </span>
        <span>{pct}%</span>
      </div>
    </div>
  )
}

