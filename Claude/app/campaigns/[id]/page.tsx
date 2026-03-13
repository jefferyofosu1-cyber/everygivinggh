'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { Campaign, Donation } from '@/types'

const EMOJI: Record<string, string> = { medical: '🏥', education: '🎓', church: '⛪', emergency: '🆘', business: '💼', community: '🏡' }

export default function CampaignPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [donating, setDonating] = useState(false)
  const [amount, setAmount] = useState(100)
  const [customAmount, setCustomAmount] = useState('')
  const [donorName, setDonorName] = useState('')
  const [message, setMessage] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchCampaign()
  }, [id])

  const fetchCampaign = async () => {
    const { data: c } = await supabase.from('campaigns').select('*, profiles(full_name, phone)').eq('id', id).single()
    const { data: d } = await supabase.from('donations').select('*').eq('campaign_id', id).eq('status', 'success').order('created_at', { ascending: false }).limit(10)
    setCampaign(c)
    setDonations(d || [])
    setLoading(false)
  }

  // Fee: 2.5% + GHS 0.50 per donation (deducted from amount before campaign receives it)
  const calcFee = (amt: number) => parseFloat((amt * 0.025 + 0.50).toFixed(2))
  const calcNet  = (amt: number) => parseFloat((amt - calcFee(amt)).toFixed(2))

  const handleDonate = async () => {
    const finalAmount = customAmount ? parseInt(customAmount) : amount
    if (!donorName) { toast.error('Please enter your name'); return }
    if (finalAmount < 1) { toast.error('Please enter a valid amount'); return }
    setDonating(true)

    const fee = calcFee(finalAmount)
    const netAmount = calcNet(finalAmount)

    // Save pending donation — store gross amount donor paid, fee, and net to campaign
    const { data: donation } = await supabase.from('donations').insert({
      campaign_id: id, donor_name: donorName, amount: finalAmount,
      message, payment_method: 'momo', status: 'pending'
    }).select().single()

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!paystackKey || paystackKey.includes('REPLACE')) {
      // Demo mode — mark as success, credit net amount to campaign
      await supabase.from('donations').update({ status: 'success' }).eq('id', donation.id)
      await supabase.from('campaigns').update({ raised_amount: (campaign?.raised_amount || 0) + netAmount }).eq('id', id)
      toast.success(`₵${finalAmount} donated! Thank you ${donorName} 🎉`)
      setShowModal(false)
      fetchCampaign()
    } else {
      const handler = (window as any).PaystackPop.setup({
        key: paystackKey,
        email: `${donorName.replace(/\s/g, '').toLowerCase()}@everygiving.com`,
        amount: finalAmount * 100,
        currency: 'GHS',
        ref: donation.id,
        onClose: () => { toast.error('Payment cancelled'); setDonating(false) },
        callback: async (response: any) => {
          // Credit net amount (after fee) to campaign
          await supabase.from('donations').update({ status: 'success', payment_reference: response.reference }).eq('id', donation.id)
          await supabase.from('campaigns').update({ raised_amount: (campaign?.raised_amount || 0) + netAmount }).eq('id', id)
          toast.success(`₵${finalAmount} donated! Thank you ${donorName} 🎉`)
          setShowModal(false)
          fetchCampaign()
        }
      })
      handler.openIframe()
    }
    setDonating(false)
  }

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">💚</div>
          <p className="text-gray-400 text-sm">Loading campaign...</p>
        </div>
      </div>
    </>
  )

  if (!campaign) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😔</div>
          <h2 className="font-nunito font-black text-navy text-xl mb-2">Campaign not found</h2>
          <a href="/campaigns" className="text-primary font-bold text-sm">Browse all campaigns →</a>
        </div>
      </div>
    </>
  )

  const pct = Math.min(Math.round((campaign.raised_amount / campaign.goal_amount) * 100), 100)
  const emoji = EMOJI[campaign.category] || '💚'
  const quickAmounts = [50, 100, 200, 500, 1000]

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-5 py-10">
        <div className="grid md:grid-cols-3 gap-8">

          {/* LEFT */}
          <div className="md:col-span-2">
            {/* Hero image */}
            <div className="bg-primary-light rounded-2xl h-64 flex items-center justify-center text-7xl mb-6 relative overflow-hidden">
              {campaign.image_url ? (
                <img src={campaign.image_url} alt={campaign.title} className="w-full h-full object-cover absolute inset-0" />
              ) : <span>{emoji}</span>}
              {campaign.verified && (
                <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                  ✓ Verified Campaign
                </div>
              )}
            </div>

            <h1 className="font-nunito font-black text-navy text-2xl leading-tight mb-2">{campaign.title}</h1>
            <p className="text-sm text-gray-400 mb-6 flex items-center gap-2">
              <span>👤 {campaign.profiles?.full_name}</span>
              <span>·</span>
              <span>📍 {campaign.location || 'Ghana'}</span>
              <span>·</span>
              <span className="capitalize">{emoji} {campaign.category}</span>
            </p>

            {/* Story */}
            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap mb-8">
              {campaign.story || 'No story provided yet.'}
            </div>

            {/* Donors */}
            {donations.length > 0 && (
              <div>
                <h3 className="font-nunito font-black text-navy text-lg mb-4">💚 Recent donors ({donations.length})</h3>
                <div className="flex flex-col gap-3">
                  {donations.map(d => (
                    <div key={d.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-xl">
                      <div>
                        <div className="font-bold text-sm text-navy">{d.donor_name}</div>
                        {d.message && <div className="text-xs text-gray-400 mt-0.5 italic">"{d.message}"</div>}
                        <div className="text-xs text-gray-300 mt-1">{new Date(d.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="font-nunito font-black text-primary text-sm">₵{d.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — sticky donation card */}
          <div className="md:col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-20">
              <div className="font-nunito font-black text-2xl text-navy mb-0.5">₵{campaign.raised_amount.toLocaleString()}</div>
              <div className="text-sm text-gray-400 mb-3">raised of ₵{campaign.goal_amount.toLocaleString()} goal</div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-primary-dark to-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mb-5">
                <span><strong className="text-navy">{donations.length}</strong> donors</span>
                <span><strong className="text-primary">{pct}%</strong> funded</span>
              </div>

              <button onClick={() => setShowModal(true)}
                className="w-full bg-primary hover:bg-primary-dark text-white font-nunito font-black py-3.5 rounded-xl transition-all hover:-translate-y-px shadow hover:shadow-lg text-sm mb-3">
                💚 Donate now
              </button>

              <button onClick={() => { navigator.share?.({ url: window.location.href, title: campaign.title }) || navigator.clipboard.writeText(window.location.href).then(() => toast.success('Link copied!')) }}
                className="w-full border-2 border-gray-200 hover:border-primary hover:text-primary text-gray-600 font-bold py-3 rounded-xl transition-all text-sm">
                🔗 Share campaign
              </button>

              {campaign.verified && (
                <div className="mt-4 bg-primary-light border border-primary/20 rounded-xl p-3 text-xs text-primary-dark">
                  <strong>✓ Verified campaign</strong><br />
                  Identity and documents confirmed by Every Giving team.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* DONATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-nunito font-black text-navy text-lg">Make a donation</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors">✕</button>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Choose amount (₵)</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {quickAmounts.map(a => (
                  <button key={a} onClick={() => { setAmount(a); setCustomAmount('') }}
                    className={`py-2.5 rounded-xl font-bold text-sm transition-all ${amount === a && !customAmount ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    ₵{a}
                  </button>
                ))}
                <input type="number" placeholder="Other" value={customAmount} onChange={e => setCustomAmount(e.target.value)}
                  className="col-span-3 bg-gray-50 border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-2.5 text-sm outline-none transition-colors text-center font-bold" />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Your name</label>
              <input type="text" value={donorName} onChange={e => setDonorName(e.target.value)} placeholder="Kwame Mensah"
                className="w-full bg-gray-50 border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
            </div>

            <div className="mb-5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Message (optional)</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Leave a word of encouragement..."
                className="w-full bg-gray-50 border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none h-20" />
            </div>

            <button onClick={handleDonate} disabled={donating}
              className="w-full bg-primary hover:bg-primary-dark text-white font-nunito font-black py-4 rounded-xl transition-all disabled:opacity-60 text-sm shadow hover:shadow-lg">
              {donating ? 'Processing...' : `Donate ₵${customAmount || amount} via MoMo / Card`}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">🔒 Secured by Paystack · MTN MoMo · Vodafone · Card</p>
          </div>
        </div>
      )}

      {/* Paystack script */}
      <script src="https://js.paystack.co/v1/inline.js" async />
      <Footer />
    </>
  )
}
