'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CheckCircle2, MessageCircle, Users, Image as ImageIcon, Copy, Smartphone, Check } from 'lucide-react'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const title = searchParams.get('title') || 'Your campaign'
  const slug = searchParams.get('slug') || 'my-campaign'
  const [copied, setCopied] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const campaignUrl = `everygivinggh.org/campaigns/${slug}`

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${campaignUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`I just started a fundraising campaign: "${title}". Please check it out and support if you can! https://${campaignUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F5F4F0] py-8 px-4 sm:py-16 sm:px-6">
        <div className="max-w-xl mx-auto">
          
          {/* SUCCESS HEADER */}
          <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#E8F5EF] rounded-full mb-6">
              <CheckCircle2 className="w-10 h-10 text-[#0A6B4B]" />
            </div>
            <h1 className="font-nunito font-black text-[#1A1A18] text-3xl mb-3">✓ Campaign submitted</h1>
            <p className="text-[#4A4A44] text-lg leading-relaxed">
              <span className="font-bold">"{title}"</span> is now under review.
            </p>
          </div>

          {/* REVIEW NOTICE */}
          <div className="bg-white border border-[#E8E4DC] rounded-3xl p-6 mb-8 text-center shadow-sm">
            <p className="text-[#4A4A44] text-sm mb-2">Our team reviews every submission personally.</p>
            <p className="text-[#1A1A18] font-bold text-sm">
              You'll receive an SMS when your campaign goes live — usually within 24 hours.
            </p>
          </div>

          {/* CHECKLIST SECTION */}
          <div className="space-y-6 mb-10">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-[#E8E4DC]"></div>
              <span className="text-[10px] font-bold text-[#8A8A82] uppercase tracking-[0.2em] whitespace-nowrap">While you wait, do these three things:</span>
              <div className="h-px flex-1 bg-[#E8E4DC]"></div>
            </div>

            <div className="space-y-4">
              {/* ITEM 1 */}
              <div className="bg-white border border-[#E8E4DC] rounded-2xl p-5 flex gap-4 items-start hover:border-[#0A6B4B]/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#F5F4F0] flex items-center justify-center font-bold text-[#1A1A18] text-xs flex-shrink-0">1</div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#1A1A18] text-sm mb-1">Write your first WhatsApp message</h3>
                  <button onClick={shareOnWhatsApp} className="text-[#0A6B4B] text-xs font-bold hover:underline flex items-center gap-1">
                    Preview draft →
                  </button>
                </div>
                <MessageCircle className="w-5 h-5 text-[#8A8A82]" />
              </div>

              {/* ITEM 2 */}
              <div className="bg-white border border-[#E8E4DC] rounded-2xl p-5 flex gap-4 items-start hover:border-[#0A6B4B]/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#F5F4F0] flex items-center justify-center font-bold text-[#1A1A18] text-xs flex-shrink-0">2</div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#1A1A18] text-sm mb-1">Tell 5 close people it's coming</h3>
                  <button onClick={shareOnWhatsApp} className="text-[#0A6B4B] text-xs font-bold hover:underline flex items-center gap-1">
                    Open WhatsApp →
                  </button>
                </div>
                <Users className="w-5 h-5 text-[#8A8A82]" />
              </div>

              {/* ITEM 3 */}
              <div className="bg-white border border-[#E8E4DC] rounded-2xl p-5 flex gap-4 items-start hover:border-[#0A6B4B]/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#F5F4F0] flex items-center justify-center font-bold text-[#1A1A18] text-xs flex-shrink-0">3</div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#1A1A18] text-sm mb-1">Prepare a second photo for your update</h3>
                  <Link href="/blog/updates-matter" className="text-[#0A6B4B] text-xs font-bold hover:underline flex items-center gap-1">
                    Learn why updates matter →
                  </Link>
                </div>
                <ImageIcon className="w-5 h-5 text-[#8A8A82]" />
              </div>
            </div>
          </div>

          {/* CAMPAIGN LINK SECTION */}
          <div className="bg-white border border-[#E8E4DC] rounded-3xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <span className="text-[10px] font-bold text-[#8A8A82] uppercase tracking-[0.2em] block mb-2">Your campaign link (share after approval):</span>
              <div className="font-nunito font-black text-[#0A6B4B] text-lg break-all">
                {campaignUrl}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 py-4 bg-[#F5F4F0] text-[#1A1A18] font-bold rounded-2xl hover:bg-[#E8E4DC] transition-colors text-sm"
              >
                {copied ? <Check className="w-4 h-4 text-[#0A6B4B]" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy link'}
              </button>
              <button 
                className="flex items-center justify-center gap-2 py-4 bg-[#F5F4F0] text-[#1A1A18] font-bold rounded-2xl hover:bg-[#E8E4DC] transition-colors text-sm"
              >
                <Smartphone className="w-4 h-4" />
                Save to phone
              </button>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/dashboard" className="text-[#8A8A82] text-sm font-semibold hover:text-[#1A1A18]">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
