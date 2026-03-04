import { Inter, DM_Sans } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

// Font configuration
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '700'],
  display: 'swap',
});

// Metadata for SEO
export const metadata: Metadata = {
  title: {
    default: 'Every Giving — Ghana\'s Trusted Crowdfunding Platform',
    template: '%s | Every Giving',
  },
  description: 'Ghana\'s most trusted crowdfunding platform. Raise money for medical bills, education, emergencies & community projects. Free to start. Verified in 24hrs. Instant MoMo payout.',
  keywords: ['crowdfunding Ghana', 'fundraising Ghana', 'donate Ghana', 'MoMo donations', 'Ghana Card verified'],
  authors: [{ name: 'Every Giving' }],
  creator: 'Every Giving',
  publisher: 'Every Giving',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://everygivinggh.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Every Giving — Ghana\'s Trusted Crowdfunding Platform',
    description: 'Raise money for what matters with Ghana\'s most trusted platform. Free to start. Verified in 24hrs.',
    url: 'https://everygivinggh.vercel.app',
    siteName: 'Every Giving',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Every Giving — Ghana\'s Crowdfunding Platform',
      },
    ],
    locale: 'en_GH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Every Giving — Ghana\'s Trusted Crowdfunding Platform',
    description: 'Raise money for what matters with Ghana\'s most trusted platform.',
    images: ['/og-image.png'],
    creator: '@everygivinggh',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification-code', // Add your Google Search Console code
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable}`}>
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#10b981" />
        
        {/* Mobile viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* Ghana-specific meta */}
        <meta name="geo.region" content="GH" />
        <meta name="geo.placename" content="Ghana" />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        {/* Skip to main content link for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-green-600 text-white px-4 py-2 rounded-lg z-50"
        >
          Skip to main content
        </a>

        {/* Header */}
        <Header />

        {/* Main content */}
        <main id="main-content" className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
