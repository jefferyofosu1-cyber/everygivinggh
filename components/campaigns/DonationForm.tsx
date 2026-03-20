'use client'
import { useState } from 'react'

export default function DonationForm({ campaign }: { campaign: any }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', amount: '', message: '' })
  const [errorMsg, setErrorMsg] = useState('')

  const amount = parseFloat(form.amount) || 0
  const fee = amount > 0 ? (amount * 0.029 + 0.5).toFixed(2) : '0.00'

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    
    if (!amount || amount < 1) {
      setErrorMsg('Minimum donation is GHS 1.00')
      return
    }

    if (!form.email) {
      setErrorMsg('Please enter your email address')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          donorName: form.name || 'Anonymous',
          email: form.email,
          amount: amount,
          message: form.message,
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to initialize donation')

      if (data.payment?.authorizationUrl) {
        // Redirect to Paystack checkout
        window.location.href = data.payment.authorizationUrl
      } else {
        throw new Error('Payment initialization failed: No checkout URL returned')
      }
    } catch (err: any) {
      setErrorMsg(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
      <h3 className="font-nunito font-black text-navy text-xl mb-6">Make a donation</h3>
      
      <form onSubmit={handleDonate} className="flex flex-col gap-5">
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 animate-shake">
            {errorMsg}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2 ml-1">Your Name</label>
            <input 
              type="text" 
              value={form.name} 
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Kwame Mensah"
              className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl px-5 py-4 text-sm outline-none transition-all font-medium" 
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2 ml-1">Email Address *</label>
            <input 
              type="email" 
              required 
              value={form.email} 
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="kwame@example.com"
              className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl px-5 py-4 text-sm outline-none transition-all font-medium" 
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2 ml-1">Donation Amount (GHS) *</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-navy font-bold text-lg">₵</span>
              <input 
                type="number" 
                required 
                min="1" 
                value={form.amount} 
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                placeholder="0.00"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl pl-10 pr-5 py-4 text-lg font-black text-navy outline-none transition-all" 
              />
            </div>
            {amount > 0 && (
              <div className="mt-2 ml-1 flex items-center justify-between text-[11px] font-bold">
                <span className="text-gray-400">Transaction fee (2.9% + ₵0.50):</span>
                <span className="text-navy">₵{fee}</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2 ml-1">Words of support (Optional)</label>
            <textarea 
              value={form.message} 
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              placeholder="Leave a kind message..."
              rows={3}
              className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl px-5 py-4 text-sm outline-none transition-all font-medium resize-none" 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-5 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-2xl transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/20 text-base disabled:opacity-60 disabled:translate-y-0"
        >
          {loading ? 'Initializing…' : `Donate ₵${amount || '0.00'}`}
        </button>
        
        <div className="space-y-3 pt-2">
          <p className="text-[10px] text-gray-400 text-center leading-relaxed font-bold uppercase tracking-wider">
            Secure payment processed by Paystack
          </p>
          <div className="flex items-center justify-center gap-4 opacity-40 grayscale hover:grayscale-0 transition-all">
            <div className="text-[10px] font-black border border-current px-2 py-0.5 rounded">VISA</div>
            <div className="text-[10px] font-black border border-current px-2 py-0.5 rounded">MASTERCARD</div>
            <div className="text-[10px] font-black border border-current px-2 py-0.5 rounded">MoMo</div>
          </div>
          <p className="text-[9px] text-primary/60 text-center font-bold">
            🛡️ Funds go directly to the verified fundraiser
          </p>
        </div>
      </form>
    </div>
  )
}
