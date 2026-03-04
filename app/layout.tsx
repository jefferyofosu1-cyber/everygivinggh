import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: "Every Giving — Ghana's Trusted Crowdfunding Platform",
  description: 'The trusted way to raise and give money in Ghana. Verified fundraisers. Mobile money payments. Full transparency.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="bottom-right" toastOptions={{
          style: { fontFamily: "'Nunito Sans', sans-serif", fontSize: '0.85rem' },
          success: { iconTheme: { primary: '#02A95C', secondary: '#fff' } },
        }} />
      </body>
    </html>
  )
}
