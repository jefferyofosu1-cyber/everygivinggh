export default function CampaignsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-5 py-12">
      <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="h-44 bg-gray-100 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
              <div className="h-2 w-full bg-gray-100 rounded-full animate-pulse mt-4" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-4 w-1/4 bg-gray-100 rounded animate-pulse" />
                <div className="h-6 w-12 bg-gray-100 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
