'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useTheme } from './ThemeProvider'

export function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  const handleSetTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Toggle theme"
        title={`Current theme: ${theme}`}
      >
        {resolvedTheme === 'dark' ? (
          <svg className="w-5 h-5 text-gray-600 dark:text-slate-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-600 dark:text-slate-300" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5" fill="currentColor" />
            <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" />
            <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" />
            <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 z-50">
          <div className="p-2">
            <button
              onClick={() => handleSetTheme('light')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-left ${
                theme === 'light'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" fill="currentColor" />
                <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" />
                <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span className="text-sm font-medium">Light</span>
            </button>
            <button
              onClick={() => handleSetTheme('dark')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-left ${
                theme === 'dark'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <span className="text-sm font-medium">Dark</span>
            </button>
            <button
              onClick={() => handleSetTheme('system')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-left ${
                theme === 'system'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="1.5" />
                <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span className="text-sm font-medium">System</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
