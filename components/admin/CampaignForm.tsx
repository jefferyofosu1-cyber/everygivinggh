'use client'

import { useEffect, useState } from 'react'
import type { Campaign, CampaignStatus, VerificationLevel } from '@/lib/sanityClient'

type Props = {
  initial?: Campaign | null
}

const STATUS_OPTIONS: CampaignStatus[] = [
  'pending',
  'verified',
  'active',
  'completed',
]

const VERIFICATION_OPTIONS: VerificationLevel[] = [
  'basic',
  'standard',
  'premium',
]

export function CampaignForm({ initial }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [slug, setSlug] = useState<string | undefined>(initial ? (initial as any).slug : undefined)
  const [category, setCategory] = useState(initial?.category ?? '')
  const [story, setStory] = useState(
    initial?.story && Array.isArray(initial.story) && initial.story[0]?.children?.[0]?.text
      ? initial.story[0].children[0].text
      : '',
  )
  const [goalAmount, setGoalAmount] = useState(
    initial?.goalAmount != null ? String(initial.goalAmount) : '',
  )
  const [beneficiaryName, setBeneficiaryName] = useState(
    initial?.beneficiaryName ?? '',
  )
  const [beneficiaryPhone, setBeneficiaryPhone] = useState(
    initial?.beneficiaryPhone ?? '',
  )
  const [verificationLevel, setVerificationLevel] = useState<VerificationLevel>(
    initial?.verificationLevel ?? 'basic',
  )
  const [status, setStatus] = useState<CampaignStatus>(
    initial?.status ?? 'pending',
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!slug && title) {
      setSlug(
        title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 96),
      )
    }
    // only derive slug on first load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const body = {
        title,
        slug,
        category,
        story,
        goalAmount: Number(goalAmount || 0),
        beneficiaryName,
        beneficiaryPhone,
        verificationLevel,
        status,
      }

      const res = await fetch('/api/admin/sanity/campaigns', {
        method: initial ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          initial
            ? {
                id: initial._id,
                ...body,
              }
            : body,
        ),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || 'Failed to save campaign')
      }

      setSuccess('Saved successfully.')
    } catch (err: any) {
      setError(err.message || 'Failed to save campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-sm text-green-400">
          {success}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="text-xs font-bold text-white/40 block mb-1.5 uppercase tracking-wider">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-white/40 block mb-1.5 uppercase tracking-wider">
            Slug
          </label>
          <input
            value={slug ?? ''}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div>
          <label className="text-xs font-bold text-white/40 block mb-1.5 uppercase tracking-wider">
            Category
          </label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-white/40 block mb-1.5 uppercase tracking-wider">
            Goal amount (GHS)
          </label>
          <input
            type="number"
            min={1}
            value={goalAmount}
            onChange={(e) => setGoalAmount(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-white/40 block mb-1.5 uppercase tracking-wider">
            Verification level
          </label>
          <select
            value={verificationLevel}
            onChange={(e) =>
              setVerificationLevel(e.target.value as VerificationLevel)
            }
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary"
          >
            {VERIFICATION_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="text-xs font-bold text-white/40 block mb-1.5 uppercase tracking-wider">
            Beneficiary name
          </label>
          <input
            value={beneficiaryName}
            onChange={(e) => setBeneficiaryName(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-white/40 block mb-1.5 uppercase tracking-wider">
            Beneficiary phone
          </label>
          <input
            value={beneficiaryPhone}
            onChange={(e) => setBeneficiaryPhone(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-white/40 block mb-1.5 uppercase tracking-wider">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as CampaignStatus)}
          className="w-full max-w-xs bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-white/40 block mb-1.5 uppercase tracking-wider">
          Story
        </label>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          rows={6}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary resize-vertical"
          placeholder="Write the full campaign story here. This will be stored as rich text in Sanity."
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-nunito font-black text-sm disabled:opacity-60 transition-all"
        >
          {loading ? 'Saving…' : initial ? 'Save changes' : 'Create campaign'}
        </button>
      </div>
    </form>
  )
}

