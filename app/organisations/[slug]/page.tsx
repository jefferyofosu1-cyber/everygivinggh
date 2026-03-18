import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// ─── TYPES ────────────────────────────────────────────────────────────────────

const TIER_CFG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  none:     { label: 'Pending',  color: '#92400E', bg: '#FEF3C7', icon: '⏳' },
  basic:    { label: 'Basic Verified',    color: '#1D4ED8', bg: '#DBEAFE', icon: '✓' },
  standard: { label: 'Verified',          color: '#065F46', bg: '#D1FAE5', icon: '✓✓' },
  premium:  { label: 'Premium Verified',  color: '#5B21B6', bg: '#EDE9FE', icon: '★' },
}

const TYPE_LABELS: Record<string, string> = {
  ngo: 'NGO / Non-profit',
  charity: 'Registered Charity',
  church: 'Church / Faith Org',
  school: 'School / University',
  hospital: 'Hospital / Clinic',
  community: 'Community Group',
  corporate: 'Corporate / CSR',
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default async function OrgProfilePage({ params }: { params: { slug: string } }) {
  const supabase = await createServerSupabaseClient()

  const { data: org } = await supabase
    .from('organisations')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'approved')
    .single()

  if (!org) notFound()

  // Fetch live campaigns for this org
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, slug, title, goal_amount, raised_amount, donor_count, cover_image, category')
    .eq('org_id', org.id)
    .eq('status', 'live')
    .order('created_at', { ascending: false })

  const totalRaised = campaigns?.reduce((s, c) => s + (c.raised_amount || 0), 0) || 0
  const totalDonors = campaigns?.reduce((s, c) => s + (c.donor_count || 0), 0) || 0
  const tier = TIER_CFG[org.verification_tier] || TIER_CFG.none
  const orgTypeLabel = TYPE_LABELS[org.type] || org.type

  return (
    <>
      {/* COVER */}
      <div style={{
        height: 220, background: org.cover_url
          ? `url(${org.cover_url}) center/cover`
          : 'linear-gradient(135deg,#0A6B4B,#185FA5)',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.35)' }} />
      </div>

      {/* HEADER CARD */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16,
          padding: '24px 28px', marginTop: -56, position: 'relative', zIndex: 10,
          display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap',
        }}>
          {/* Logo */}
          <div style={{
            width: 80, height: 80, borderRadius: 16, overflow: 'hidden', flexShrink: 0,
            background: org.logo_url ? 'transparent' : '#E8F5EF',
            border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,.1)',
          }}>
            {org.logo_url
              ? <img src={org.logo_url} alt={org.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: '#0A6B4B' }}>{org.name[0]}</div>
            }
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: 0 }}>{org.name}</h1>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: tier.bg, color: tier.color }}>
                {tier.icon} {tier.label}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>
              {orgTypeLabel} · {org.location}, Ghana
            </div>
            {org.website && (
              <a href={org.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#0A6B4B', textDecoration: 'underline' }}>
                {org.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>

          <Link href={`/campaigns?org=${org.id}`}
            style={{ background: '#0A6B4B', color: '#fff', fontWeight: 700, fontSize: 13, padding: '10px 20px', borderRadius: 100, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Donate →
          </Link>
        </div>

        {/* STATS BAR */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
          background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12,
          margin: '16px 0', overflow: 'hidden',
        }}>
          {[
            { label: 'Total raised', value: `₵${totalRaised.toLocaleString()}` },
            { label: 'Active campaigns', value: campaigns?.length || 0 },
            { label: 'Total donors', value: totalDonors.toLocaleString() },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              padding: '18px 24px', textAlign: 'center',
              borderRight: i < 2 ? '1px solid #E5E7EB' : 'none',
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#0A6B4B', marginBottom: 2 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* BODY */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, padding: '0 0 64px' }}>
          {/* MAIN */}
          <div>
            {/* About */}
            {(org.description || org.mission) && (
              <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: 24, marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 12 }}>About {org.name}</div>
                {org.mission && (
                  <div style={{ background: '#F0FBF6', borderLeft: '3px solid #0A6B4B', borderRadius: '0 8px 8px 0', padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#065F46', fontStyle: 'italic', lineHeight: 1.65 }}>
                    {org.mission}
                  </div>
                )}
                {org.description && (
                  <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.8 }}>{org.description}</p>
                )}
              </div>
            )}

            {/* Campaigns */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
                Active campaigns ({campaigns?.length || 0})
              </div>
              {!campaigns?.length ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#9CA3AF', fontSize: 13 }}>
                  No active campaigns yet. Check back soon.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {campaigns.map(c => {
                    const pct = c.goal_amount ? Math.min(100, Math.round((c.raised_amount / c.goal_amount) * 100)) : 0
                    return (
                      <Link key={c.id} href={`/campaigns/${c.slug || c.id}`}
                        style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 14, border: '1px solid #E5E7EB', borderRadius: 12, textDecoration: 'none', transition: 'border-color .15s' }}>
                        <div style={{
                          width: 56, height: 56, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
                          background: c.cover_image ? `url(${c.cover_image}) center/cover` : '#E8F5EF',
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                          <div style={{ height: 4, background: '#E5E7EB', borderRadius: 99, marginBottom: 4, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: '#0A6B4B', borderRadius: 99 }} />
                          </div>
                          <div style={{ fontSize: 11, color: '#6B7280' }}>₵{(c.raised_amount || 0).toLocaleString()} raised · {pct}%</div>
                        </div>
                        <div style={{ fontSize: 12, color: '#0A6B4B', fontWeight: 700, flexShrink: 0 }}>Give →</div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <div>
            {/* Trust card */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: 20, marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Verification</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: tier.bg, color: tier.color }}>{tier.label}</span>
                </div>
                {org.reg_number && (
                  <div style={{ fontSize: 12, color: '#6B7280' }}>Reg. No: <strong style={{ color: '#374151' }}>{org.reg_number}</strong></div>
                )}
                {[
                  'Identity confirmed by EveryGiving team',
                  'Documents reviewed',
                  'Funds secured via Paystack',
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', fontSize: 11, color: '#6B7280', lineHeight: 1.5 }}>
                    <span style={{ color: '#0A6B4B', fontWeight: 700, flexShrink: 0 }}>✓</span>{t}
                  </div>
                ))}
              </div>
            </div>

            {/* Social links */}
            {(org.social_links?.facebook || org.social_links?.instagram || org.website) && (
              <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: 20, marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Links</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {org.website && <a href={org.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#0A6B4B', textDecoration: 'underline' }}>🌐 Website</a>}
                  {org.social_links?.facebook && <a href={`https://facebook.com/${org.social_links.facebook}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#1877F2', textDecoration: 'underline' }}>Facebook</a>}
                  {org.social_links?.instagram && <a href={`https://instagram.com/${org.social_links.instagram?.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#E1306C', textDecoration: 'underline' }}>Instagram</a>}
                </div>
              </div>
            )}

            {/* CTA */}
            <div style={{ background: '#0A6B4B', borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Support {org.name}</div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', lineHeight: 1.6, marginBottom: 14 }}>
                Your donation goes directly to verified campaigns. MoMo payment — no card needed.
              </p>
              <Link href={`/campaigns?org=${org.id}`}
                style={{ display: 'block', textAlign: 'center', background: '#fff', color: '#0A6B4B', fontWeight: 700, fontSize: 12, padding: '10px', borderRadius: 8, textDecoration: 'none' }}>
                Browse their campaigns →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
