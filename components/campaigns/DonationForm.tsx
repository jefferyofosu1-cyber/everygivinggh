'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePaystackPayment } from 'react-paystack'
import { createClient } from '@/lib/supabase'

export default function DonationForm({ campaign }: { campaign: any }) {
  const [donating, setDonating] = useState(false)
  const [donated, setDonated] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', amount: '', message: '', method: 'MTN MoMo' })
  const [errorMsg, setErrorMsg] = useState('')
  const [donationId, setDonationId] = useState<string | null>(null)

  const totalAmount = parseFloat(form.amount) || 0

  const paystackConfig = {
    reference: `${campaign?.id}-${Date.now()}`,
    email: form.email,
    amount: Math.round(totalAmount * 100),
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    currency: 'GHS',
    metadata: {
      campaign_id: campaign?.id,
      donation_id: donationId,
      donor_name: form.name || 'Anonymous',
      message: form.message,
      payment_method: form.method,
    }
  }

  const initializePayment = usePaystackPayment(paystackConfig as any)

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    
    if (!totalAmount || totalAmount <= 0 || !form.email || !campaign) {
      setErrorMsg('Please enter an amount and your email')
      return
    }

    setDonating(true)

    try {
      const res = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaign.id,
          donor_name: form.name || 'Anonymous',
          donor_email: form.email,
          amount: totalAmount,
          tip_amount: 0,
          message: form.message,
          payment_method: form.method,
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to initialize donation')

      setDonationId(data.donationId)

      const onSuccess = async (reference: any) => {
        try {
          const supabase = createClient()
          await supabase
            .from('donations')
            .update({ status: 'success', payment_reference: reference.reference })
            .eq('id', data.donationId)
          
          setDonated(true)
          setDonating(false)
        } catch (err) {
          console.error('Update error:', err)
          setDonated(true) // Still show success message to user
          setDonating(false)
        }
      }

      const onClose = () => {
        setDonating(false)
      }

      const dynamicConfig = {
        ...paystackConfig,
        metadata: { ...paystackConfig.metadata, donation_id: data.donationId }
      }
      
      initializePayment({ onSuccess, onClose, config: dynamicConfig } as any)

    } catch (err: any) {
      setErrorMsg(err.message)
      setDonating(false)
    }
  }

  if (donated) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl mx-auto mb-4">💚</div>
        <h2 className="font-nunito font-black text-navy text-2xl mb-2">Thank you!</h2>
        <p className="text-gray-500 text-sm mb-6">Your donation of <strong>₵{totalAmount}</strong> helps make a difference.</p>
        <button onClick={() => setDonated(false)} className="text-primary text-sm font-bold hover:underline">Make another donation</button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-20">
      <form onSubmit={handleDonate} className="flex flex-col gap-4">
        {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100">{errorMsg}</div>}
        
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5 ml-1">Your Name</label>
          <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Ama Mensah"
            className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5 ml-1">Email Address *</label>
          <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="ama@example.com"
            className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5 ml-1">Amount (GHC) *</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₵</span>
            <input type="number" required min="1" max="50000" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              placeholder="50"
              className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl pl-8 pr-4 py-3 text-sm outline-none transition-all" />
          </div>
        </div>


        <button type="submit" disabled={donating}
          className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 text-sm disabled:opacity-60">
          {donating ? 'Processing…' : `Donate ₵${form.amount || '—'} →`}
        </button>
        
        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
          Secure payment via Paystack<br />
          MoMo, Card, and Bank Transfer
        </p>
      </form>
    </div>
  )
}
