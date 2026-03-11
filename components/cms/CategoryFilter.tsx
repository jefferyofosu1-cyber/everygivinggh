'use client'

import { useRouter, useSearchParams } from 'next/navigation'

type Category = {
  slug: string
  name: string
  icon?: string
}

type Props = {
  categories: Category[]
}

export function CategoryFilter({ categories }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('category') || 'all'

  function setCategory(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (!slug || slug === 'all') {
      params.delete('category')
    } else {
      params.set('category', slug)
    }
    params.delete('page')
    router.push(`/explore?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setCategory(null)}
        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
          active === 'all'
            ? 'bg-primary text-white shadow-md shadow-primary/20'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => setCategory(cat.slug)}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            active === cat.slug
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {cat.icon} {cat.name}
        </button>
      ))}
    </div>
  )
}

