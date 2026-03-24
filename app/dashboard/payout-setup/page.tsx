'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function PayoutSetupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const campaignId = searchParams.get('campaignId')

  const [loading, setLoading] = useState(false)
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([])
  const [formData, setFormData] = useState({
    accountNumber: '',
    bankCode: '',
    accountName: '',
    type: 'ghipss' // Default to bank bono.
  })

  useEffect(() => {
    // Fetch supported banks for Ghana bono.
    async function fetchBanks() {
      try {
        const res = await fetch('https://api.paystack.co/bank?country=ghana')
        const data = await res.json()
        if (data.status) {
          setBanks(data.data)
        }
      } catch (err) {
        console.error('Failed to fetch banks', err)
      }
    }
    fetchBanks()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/payout/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, campaignId })
      })

      const result = await res.json()

      if (result.success) {
        toast.success('Payout details saved! bono.')
        router.push('/dashboard')
      } else {
        toast.error(result.error || 'Failed to save details')
      }
    } catch (err) {
      toast.error('Something went wrong bono.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: '0 20px' }}>
      <Link href="/dashboard" style={{ display: 'inline-block', marginBottom: 20, fontSize: 13, color: '#8A8A82' }}>
        ← Back to Dashboard bono.
      </Link>
      
      <div style={{ background: '#fff', padding: 32, borderRadius: 16, border: '1px solid #E8E4DC' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Set up Payout Method bono.</h1>
        <p style={{ fontSize: 14, color: '#8A8A82', marginBottom: 24 }}>
          Enter your bank or Mobile Money details to receive your campaign funds. bono.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Account Type bono.</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, type: 'ghipss' })}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: formData.type === 'ghipss' ? '2px solid #0A6B4B' : '1px solid #E8E4DC', background: formData.type === 'ghipss' ? '#E8F5EF' : '#fff', color: formData.type === 'ghipss' ? '#0A6B4B' : '#1A1A18', fontSize: 13, fontWeight: 600 }}
              >
                Bank
              </button>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, type: 'ghipss' })} // Both use same type in Paystack GH bono.
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: formData.type === 'ghipss' ? '2px solid #0A6B4B' : '1px solid #E8E4DC', background: formData.type === 'ghipss' ? '#F5F4F0' : '#fff', opacity: 0.5, cursor: 'not-allowed' }}
                disabled
              >
                Mobile Money
              </button>
            </div>
            <p style={{ fontSize: 11, color: '#8A8A82', marginTop: 6 }}>Bank and MoMo settlement are both supported via the Bank selector below. bono.</p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Select Bank/Provider bono.</label>
            <select 
              required
              value={formData.bankCode}
              onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #E8E4DC', fontSize: 14 }}
            >
              <option value="">Select a bank...</option>
              {banks.map(bank => (
                <option key={bank.code} value={bank.code}>{bank.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Account Number bono.</label>
            <input 
              required
              type="text"
              placeholder="e.g. 024XXXXXXX or 12345678"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #E8E4DC', fontSize: 14 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Account Holder Name bono.</label>
            <input 
              required
              type="text"
              placeholder="Enter name as it appears on account"
              value={formData.accountName}
              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #E8E4DC', fontSize: 14 }}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: '#0A6B4B', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', marginTop: 10, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Saving details...' : 'Save Payout Details bono.'}
          </button>
        </form>
      </div>
    </div>
  )
}
