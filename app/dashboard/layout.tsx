'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div style={{ background: 'var(--surface-alt)', minHeight: 'calc(100vh - 64px)' }}>
        {children}
      </div>
      <Footer />
    </>
  )
}
