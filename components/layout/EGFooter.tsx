import Link from 'next/link'

interface EGFooterProps {
  dark?: boolean
}

export default function EGFooter({ dark = false }: EGFooterProps) {
  const bg = dark ? '#111110' : '#1A1A18'

  const cols = [
    {
      heading: 'For campaigners',
      links: [
        { href: '/create',              label: 'Start a campaign' },
        { href: '/how-it-works',        label: 'How it works' },
        { href: '/fees',                label: 'Fees' },
        { href: '/verify-id',           label: 'Verify your identity' },
        { href: '/fundraising-tips',    label: 'Fundraising tips' },
      ],
    },
    {
      heading: 'For donors',
      links: [
        { href: '/campaigns',           label: 'Browse campaigns' },
        { href: '/fundraising-categories', label: 'Categories' },
        { href: '/trust',               label: 'Trust & safety' },
        { href: '/transparency',        label: 'Transparency' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { href: '/about',               label: 'About us' },
        { href: '/blog',                label: 'Blog' },
        { href: '/contact',             label: 'Contact' },
        { href: '/privacy',             label: 'Privacy policy' },
        { href: '/terms',               label: 'Terms of service' },
      ],
    },
  ]

  return (
    <footer style={{
      background: bg,
      padding: '52px 28px 32px',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
          {/* Brand column */}
          <div>
            <div style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 21, color: '#FFFFFF', marginBottom: 12,
            }}>
              Every<em style={{ color: '#B7DEC9', fontStyle: 'normal' }}>Giving</em>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, maxWidth: 240, marginBottom: 20 }}>
              Ghana's first identity-verified crowdfunding platform. Every fundraiser, Ghana Card confirmed.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['Twitter', 'Instagram', 'Facebook'].map(s => (
                <a key={s} href={`https://${s.toLowerCase()}.com`}
                  style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', padding: '5px 10px', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 6, textDecoration: 'none' }}>
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.heading}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)', marginBottom: 14 }}>
                {col.heading}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {col.links.map(l => (
                  <Link key={l.href} href={l.href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
            © {new Date().getFullYear()} EveryGiving Ltd · Accra, Ghana
          </span>
          <div style={{ display: 'flex', gap: 20 }}>
            {[{ href: '/privacy', label: 'Privacy' }, { href: '/terms', label: 'Terms' }, { href: '/contact', label: 'Contact' }].map(l => (
              <Link key={l.href} href={l.href} style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)', textDecoration: 'none' }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
