/**
 * Donation Form Component
 * - Shows fee breakdown
 * - Handles payment initialization
 * - Mobile-friendly design
 * - Real-time fee calculation
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface DonationFormProps {
  campaignId: string
  campaignTitle: string
  campaignGoal: number
  campaignRaised: number
  fundraiserName: string
  donorEmail?: string
}

export default function DonationForm({
  campaignId,
  campaignTitle,
  campaignGoal,
  campaignRaised,
  fundraiserName,
  donorEmail = '',
}: DonationFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State
  const [amount, setAmount] = useState<string>('')
  const [email, setEmail] = useState<string>(donorEmail || '')
  const [name, setName] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [successAmount, setSuccessAmount] = useState<number | null>(null)

  // Calculate fee in real-time
  const amountNum = parseFloat(amount) || 0
  const fee = amountNum > 0 ? calculateFee(amountNum) : 0
  const netAmount = amountNum - fee
  const progressPercent = Math.min((campaignRaised / campaignGoal) * 100, 100)

  // Handle retry from failed payment
  useEffect(() => {
    const retryAmount = searchParams.get('amount')
    const retryEmail = searchParams.get('email')
    const retryName = searchParams.get('name')

    if (retryAmount) setAmount(retryAmount)
    if (retryEmail) setEmail(retryEmail)
    if (retryName) setName(retryName)
  }, [searchParams])

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate
      if (!amount || parseFloat(amount) <= 0) {
        setError('Please enter a valid amount')
        setLoading(false)
        return
      }

      if (!email) {
        setError('Please enter your email')
        setLoading(false)
        return
      }

      if (!name) {
        setError('Please enter your name')
        setLoading(false)
        return
      }

      const amountNum = parseFloat(amount)
      if (amountNum < 1 || amountNum > 10000) {
        setError('Amount must be between GHS 1.00 and GHS 10,000.00')
        setLoading(false)
        return
      }

      console.log('[Donation] Initializing payment:', {
        amount: amountNum,
        email,
        campaign: campaignId,
      })

      // Initialize payment
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountNum,
          email,
          campaignId,
          donorName: name,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to initialize payment. Please try again.')
        setLoading(false)
        return
      }

      console.log('[Donation] Payment initialized:', data.donation.reference)

      // Redirect to Paystack checkout
      if (data.payment?.authorizationUrl) {
        setSuccessAmount(amountNum)
        // Redirect after brief delay to show success state
        setTimeout(() => {
          window.location.href = data.payment.authorizationUrl
        }, 500)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      console.error('[Donation] Error:', message)
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Make a Donation
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Support: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{campaignTitle}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 space-y-6"
            >
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3">
                  Donation Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-lg font-semibold text-gray-600 dark:text-slate-400">
                    GHS
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100.00"
                    disabled={loading}
                    className="w-full pl-14 pr-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 disabled:opacity-50 dark:bg-slate-800 dark:text-white transition"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
                  Minimum: GHS 1.00 • Maximum: GHS 10,000.00
                </p>
              </div>

              {/* Fee Breakdown */}
              {amountNum > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-slate-300">Donation Amount:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      GHS {amountNum.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-emerald-200 dark:border-emerald-800 pt-2">
                    <span className="text-gray-600 dark:text-slate-400 text-xs">
                      Transaction Fee (2.9% + GHS 0.50):
                    </span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      -GHS {fee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base border-t border-emerald-200 dark:border-emerald-800 pt-2">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                      Funds to Fundraiser:
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      GHS {netAmount.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 italic pt-2">
                    ✓ Funds go directly to {fundraiserName}
                  </p>
                </div>
              )}

              {/* Donor Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 disabled:opacity-50 dark:bg-slate-800 dark:text-white transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 disabled:opacity-50 dark:bg-slate-800 dark:text-white transition"
                  />
                  <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
                    We'll send your receipt and updates to this email
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {successAmount && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    ✓ Payment initialized! Redirecting to checkout...
                  </p>
                </div>
              )}

              {/* Payment Methods */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-slate-400 mb-3 font-medium">
                  Accepted Payment Methods:
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded px-3 py-1 text-gray-700 dark:text-slate-300">
                    💳 Cards
                  </span>
                  <span className="text-xs bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded px-3 py-1 text-gray-700 dark:text-slate-300">
                    📱 Mobile Money
                  </span>
                  <span className="text-xs bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded px-3 py-1 text-gray-700 dark:text-slate-300">
                    🏦 Bank Transfer
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !amount || parseFloat(amount) <= 0}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  `Donate GHS ${amountNum.toFixed(2) || '0.00'} →`
                )}
              </button>

              {/* Terms */}
              <p className="text-xs text-center text-gray-500 dark:text-slate-500">
                By donating, you agree to our{' '}
                <Link href="/terms" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                  Terms
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </form>
          </div>

          {/* Campaign Progress Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Campaign Progress</h3>

              <div className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {Math.round(progressPercent)}%
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      of goal
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Raised</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      GHS {(campaignRaised / 100).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Goal</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      GHS {(campaignGoal / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Remaining */}
                {campaignRaised < campaignGoal && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-slate-400">Still needed</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      GHS {((campaignGoal - campaignRaised) / 100).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
                ℹ️ Transaction Details
              </h4>
              <ul className="text-xs space-y-2 text-blue-800 dark:text-blue-200">
                <li>✓ Secure payment via Paystack</li>
                <li>✓ Multiple payment methods</li>
                <li>✓ Instant donation confirmation</li>
                <li>✓ Direct fund distribution</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// UTILITIES
// ============================================================================

function calculateFee(amount: number): number {
  const percentage = amount * 0.029
  const flatFee = 0.5
  return percentage + flatFee
}
