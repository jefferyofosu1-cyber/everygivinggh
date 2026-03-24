'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div style={{ background: '#F5F4F0', minHeight: 'calc(100vh - 64px)' }}>
        {children}
      </div>
      <Footer />
    </>
  )
}
