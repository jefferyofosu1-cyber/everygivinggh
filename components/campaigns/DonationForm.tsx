'use client'
import { useState } from 'react'

export default function DonationForm({ campaign }: { campaign: any }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', amount: '', message: '', tip: '15' })
  const [errorMsg, setErrorMsg] = useState('')

  const amount = parseFloat(form.amount) || 0
  const tipPercent = parseFloat(form.tip) || 0
  const tipAmount = amount * (tipPercent / 100)
  const fee = amount > 0 ? (amount * 0.029 + 0.5).toFixed(2) : '0.00'
  const total = amount + tipAmount

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
          tip: tipAmount,
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
          </div>

          {/* Tip Section */}
          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary block ml-1">EveryGiving Tip</label>
              <span className="text-primary font-bold text-xs">₵{tipAmount.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-gray-500 mb-3 leading-tight font-medium">
              EveryGiving has a 0% platform fee for fundraisers. We rely on tips from generous donors like you to keep the platform running.
            </p>
            <div className="flex gap-2">
              {['0', '10', '15', '20', '25'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, tip: t }))}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                    form.tip === t 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-white text-gray-400 hover:text-navy border border-gray-100'
                  }`}
                >
                  {t === '0' ? 'None' : `${t}%`}
                </button>
              ))}
            </div>
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

        <div className="space-y-3 font-bold">
          <div className="flex justify-between text-xs py-2 border-t border-dashed border-gray-100">
             <span className="text-gray-400">Campaign Donation:</span>
             <span className="text-navy">₵{amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs pb-2">
             <span className="text-gray-400">Platform Tip:</span>
             <span className="text-navy">₵{tipAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
             <span className="font-black text-navy uppercase tracking-wider">Total:</span>
             <span className="font-black text-primary text-lg">₵{total.toFixed(2)}</span>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-5 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-2xl transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/20 text-base disabled:opacity-60 disabled:translate-y-0"
        >
          {loading ? 'Initializing…' : `Donate ₵${total.toFixed(2)}`}
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
