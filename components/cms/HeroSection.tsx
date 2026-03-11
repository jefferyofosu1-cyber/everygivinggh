import Link from 'next/link'

type HeroSectionProps = {
  title: string
  subtitle: string
  ctaPrimaryHref: string
  ctaPrimaryLabel: string
  ctaSecondaryHref?: string
  ctaSecondaryLabel?: string
}

export function HeroSection({
  title,
  subtitle,
  ctaPrimaryHref,
  ctaPrimaryLabel,
  ctaSecondaryHref,
  ctaSecondaryLabel,
}: HeroSectionProps) {
  return (
    <section className="relative bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="font-nunito font-black text-navy text-4xl md:text-5xl leading-tight tracking-tight mb-4">
            {title}
          </h1>
          <p className="text-gray-500 text-base md:text-lg mb-6 leading-relaxed max-w-md">
            {subtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={ctaPrimaryHref}
              className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-full text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/25"
            >
              {ctaPrimaryLabel}
            </Link>
            {ctaSecondaryHref && ctaSecondaryLabel && (
              <Link
                href={ctaSecondaryHref}
                className="px-7 py-3 border-2 border-gray-200 hover:border-primary text-gray-600 hover:text-primary font-bold rounded-full text-sm transition-all"
              >
                {ctaSecondaryLabel}
              </Link>
            )}
          </div>
        </div>
        <div className="hidden md:block">
          <div className="relative h-72 bg-gradient-to-br from-primary-light to-blue-50 rounded-3xl border border-gray-100 shadow-xl flex items-center justify-center">
            <div className="text-6xl">💚</div>
            <div className="absolute bottom-5 left-6 right-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 text-sm text-gray-600">
              Every donation is protected with identity verification and milestone-based payouts.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

