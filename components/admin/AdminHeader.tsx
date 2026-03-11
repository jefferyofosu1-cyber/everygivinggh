type Props = {
  title: string
  subtitle?: string
}

export function AdminHeader({ title, subtitle }: Props) {
  return (
    <div className="mb-6">
      <h1 className="font-nunito font-black text-white text-2xl mb-1">
        {title}
      </h1>
      {subtitle && (
        <p className="text-white/30 text-sm">
          {subtitle}
        </p>
      )}
    </div>
  )
}

