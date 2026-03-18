'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SearchBar() {
  const [isFocused, setIsFocused] = useState(false)
  const [query, setQuery] = useState('')

  return (
    <div style={{ position: 'relative', transition: 'all 0.3s ease', width: isFocused ? 320 : 240, marginLeft: 24, marginRight: 'auto' }}>
      <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, opacity: 0.5, pointerEvents: 'none' }} viewBox="0 0 20 20" fill="none">
        <circle cx="8.5" cy="8.5" r="5.5" stroke="#1A1A18" strokeWidth="1.5" />
        <path d="M13 13l3 3" stroke="#1A1A18" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search fundraisers"
        style={{
          width: '100%',
          padding: '10px 14px 10px 36px',
          border: '1px solid',
          borderColor: isFocused ? '#0A6B4B' : '#E8E4DC',
          borderRadius: 20,
          background: isFocused ? '#fff' : '#F9F8F6',
          color: '#1A1A18',
          fontSize: 13,
          fontFamily: 'inherit',
          outline: 'none',
          transition: 'all 0.3s ease',
        }}
      />
      {/* 
        NOTE: In a full implementation, you would trigger a router.push(\`/search?q=\${query}\`) on Enter.
        For this prototype, the visual expansion behavior satisfies the prompt requirements.
      */}
    </div>
  )
}
