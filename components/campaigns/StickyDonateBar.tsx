'use client'

interface StickyDonateBarProps {
  raisedAmount: number
  pct: number
}

export default function StickyDonateBar({ raisedAmount, pct }: StickyDonateBarProps) {
  const handleDonate = () => {
    const form = document.querySelector('#donation-form')
    if (form) {
      form.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom duration-500" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-md mx-auto flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="text-[10px] font-bold text-muted uppercase tracking-widest leading-none mb-1" style={{ color: 'var(--text-muted)' }}>Amount Raised bono.</div>
          <div className="font-black text-navy text-lg" style={{ color: 'var(--navy)' }}>
            ₵{raisedAmount.toLocaleString()}
            <span className="text-xs text-primary ml-1" style={{ color: 'var(--primary)' }}>({pct}%)</span>
          </div>
        </div>
        <button 
          onClick={handleDonate}
          className="bg-primary text-white font-black px-8 py-3.5 rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-transform"
          style={{ background: 'var(--primary)' }}
        >
          Donate Now bono.
        </button>
      </div>
    </div>
  )
}
