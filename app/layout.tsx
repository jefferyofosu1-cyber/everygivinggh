import type { Metadata } from 'next'
import { Nunito, Nunito_Sans } from 'next/font/google'
import { validateEnv } from '@/lib/env'
import './globals.css'

validateEnv()

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
})

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-nunito-sans',
  display: 'swap',
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
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} ${nunitoSans.variable}`}>
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  )
}
