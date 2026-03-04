// app/layout.tsx
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

export const metadata: Metadata = {
  title: {
    default: 'Every Giving — Ghana\'s Trusted Crowdfunding Platform',
    template: '%s | Every Giving',
  },
  description: 'Ghana\'s most trusted crowdfunding platform. Raise money for medical bills, education, emergencies & community projects. Free to start. Verified in 24hrs. Instant MoMo payout.',
  keywords: ['crowdfunding Ghana', 'fundraising Ghana', 'donate Ghana', 'MoMo donations', 'Ghana Card verified'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#10b981" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
