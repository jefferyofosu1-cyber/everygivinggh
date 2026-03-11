type StatsCardProps = {
  label: string
  value: string | number
  colorClass?: string
}

export function StatsCard({ label, value, colorClass }: StatsCardProps) {
  return (
    <div className="bg-gray-900 border border-white/5 rounded-xl px-5 py-4">
      <div
        className={`font-nunito font-black text-xl ${
          colorClass || 'text-white'
        }`}
      >
        {value}
      </div>
      <div className="text-white/30 text-xs">{label}</div>
    </div>
  )
}

