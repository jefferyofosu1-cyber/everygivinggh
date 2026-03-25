import type { Metadata } from 'next'
import { Nunito, Nunito_Sans } from 'next/font/google'
import { validateEnv } from '@/lib/env'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

validateEnv()

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
  adjustFontFallback: false,
})

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-nunito-sans',
  display: 'swap',
  adjustFontFallback: false,
})

export const metadata: Metadata = {
  title: {
    default: "EveryGiving - Ghana's Trusted Crowdfunding Platform",
    template: '%s | EveryGiving',
  },
  description: 'The trusted way to raise and give money in Ghana. Verified fundraisers, mobile money payments, and full transparency. Start your campaign today.',
  keywords: ['crowdfunding Ghana', 'fundraising Ghana', 'MoMo donations', 'verified fundraiser', 'EveryGiving'],
  authors: [{ name: 'EveryGiving' }],
  creator: 'EveryGiving',
  metadataBase: new URL('https://everygiving.org'),
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    url: 'https://everygiving.org',
    siteName: 'EveryGiving',
    title: "EveryGiving - Ghana's Trusted Crowdfunding Platform",
    description: 'Raise money for medical bills, school fees, emergencies and more. Verified campaigns. MoMo payments. Built for Ghana.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EveryGiving - Crowdfunding for Ghana' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "EveryGiving - Ghana's Trusted Crowdfunding Platform",
    description: 'Raise money for medical bills, school fees, emergencies and more. Verified campaigns. MoMo payments.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} ${nunitoSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* Prevent theme flash on page load */}
        <script dangerouslySetInnerHTML={{__html: `
          (function() {
            const theme = localStorage.getItem('theme') || 'system';
            let isDark = false;
            
            if (theme === 'dark') {
              isDark = true;
            } else if (theme === 'system') {
              isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            
            if (isDark) {
              document.documentElement.classList.add('dark');
            }
          })()
        `}} />
        {/* Suppress Paystack iframe deprecation warning */}
        <script dangerouslySetInnerHTML={{__html: `
          if (typeof console !== 'undefined' && typeof console.warn === 'function') {
            const originalWarn = console.warn;
            console.warn = function(...args) {
              if (args[0] && typeof args[0] === 'string' && args[0].includes('Allow attribute will take precedence')) {
                return;
              }
              originalWarn.apply(console, args);
            };
          }
        `}} />
      </head>
      <body className="min-h-screen flex flex-col transition-colors" style={{ fontFamily: "'DM Sans', sans-serif", margin: 0, background: 'var(--surface)', color: 'var(--text-main)' }}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
