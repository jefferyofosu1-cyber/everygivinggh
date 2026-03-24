export default function CampaignsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-5 py-12">
      <div className="h-8 w-48 rounded-lg animate-pulse mb-8" style={{ background: 'var(--border)' }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border overflow-hidden shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="h-44 animate-pulse" style={{ background: 'var(--surface-alt)' }} />
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 rounded animate-pulse" style={{ background: 'var(--surface-alt)' }} />
              <div className="h-3 w-1/2 rounded animate-pulse" style={{ background: 'var(--surface-alt)' }} />
              <div className="h-2 w-full rounded-full animate-pulse mt-4" style={{ background: 'var(--surface-alt)' }} />
              <div className="flex justify-between items-center pt-2">
                <div className="h-4 w-1/4 rounded animate-pulse" style={{ background: 'var(--surface-alt)' }} />
                <div className="h-6 w-12 rounded-full animate-pulse" style={{ background: 'var(--surface-alt)' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
