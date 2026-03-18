import Link from 'next/link'

export const metadata = {
  title: 'About EveryGiving',
  description: 'Learn about EveryGiving — the trusted crowdfunding platform built for Ghana. Our mission, values, and commitment to transparent, community-focused fundraising.',
}

export default function AboutPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body { color: #1A1A18; -webkit-font-smoothing: antialiased; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: inherit; text-decoration: none; }
        .value-card { background: #fff; border: 1px solid #E8E4DC; border-radius: 14px; padding: 28px; transition: all 0.18s; }
        .value-card:hover { box-shadow: 0 10px 28px rgba(0,0,0,0.07); transform: translateY(-2px); }
        .stat-card { background: #fff; border: 1px solid #E8E4DC; border-radius: 12px; padding: 24px 20px; text-align: center; }
      `}} />

      {/* HERO */}
      <div style={{ background: '#1A1A18', padding: '72px 32px 80px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#B7DEC9', marginBottom: 16 }}>
            About EveryGiving
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.1, color: '#fff', marginBottom: 24 }}>
            Rebuilding trust in<br />
            <em style={{ fontStyle: 'italic', color: '#B7DEC9' }}>giving across Ghana.</em>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, maxWidth: 600 }}>
            EveryGiving is Ghana&apos;s first identity-verified crowdfunding platform. We exist to make it
            safe, simple, and dignified for individuals and communities to raise money and receive help
            — powered by Mobile Money and built entirely for the Ghanaian context.
          </p>
        </div>
      </div>

      {/* STATS */}
      <div style={{ background: '#FDFAF5', padding: '60px 32px', borderBottom: '1px solid #E8E4DC' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {[
            { n: '0%',   label: 'Platform fee', sub: 'We never charge campaigners to create or publish a campaign.' },
            { n: '24hr', label: 'Verification turnaround', sub: 'Typical time from ID submission to campaign going live.' },
            { n: '3x',   label: 'More raised when verified', sub: 'Verified campaigns consistently raise more than unverified ones.' },
            { n: '100%', label: 'Campaigns ID-verified', sub: 'Every live campaign has been identity-checked before publication.' },
          ].map((stat, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 40, color: '#0A6B4B', marginBottom: 8, lineHeight: 1 }}>{stat.n}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A18', marginBottom: 8 }}>{stat.label}</div>
              <div style={{ fontSize: 12, color: '#8A8A82', lineHeight: 1.6 }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MISSION */}
      <div style={{ padding: '80px 32px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0A6B4B', marginBottom: 12 }}>Our mission</div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: '#1A1A18', lineHeight: 1.2, marginBottom: 20 }}>
              Every person deserves to receive help with dignity.
            </h2>
            <p style={{ fontSize: 15, color: '#4A4A44', lineHeight: 1.8, marginBottom: 16 }}>
              In Ghana, informal community fundraising has always been strong — from church collections
              to workplace contributions. But when those same needs translate to the internet, trust
              breaks down. Donors don&apos;t know if a campaign is legitimate. Campaigners struggle to
              build credibility without a track record.
            </p>
            <p style={{ fontSize: 15, color: '#4A4A44', lineHeight: 1.8 }}>
              EveryGiving fixes this by requiring every fundraiser to verify their identity using their
              Ghana Card before a campaign can go live. This single step restores the trust that makes
              community giving possible — online and at scale.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Medical & Health', desc: 'Hospital bills, treatment, surgery and rehabilitation.' },
              { label: 'Education', desc: 'School fees, university costs, exam materials, and scholarships.' },
              { label: 'Community Projects', desc: 'Boreholes, schools, renovation, and local infrastructure.' },
              { label: 'Family & Emergency', desc: 'Funeral expenses, disaster recovery, and urgent family needs.' },
              { label: 'Faith Communities', desc: 'Church building, renovation, and community outreach projects.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px', background: '#FDFAF5', border: '1px solid #E8E4DC', borderRadius: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0A6B4B', marginTop: 6, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A18', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: '#8A8A82' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VALUES */}
      <div style={{ padding: '80px 32px', background: '#FDFAF5', borderTop: '1px solid #E8E4DC' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0A6B4B', marginBottom: 12 }}>Our values</div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: '#1A1A18' }}>What we stand for</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              {
                title: 'Dignity over charity',
                accent: '#0A6B4B',
                body: 'Asking for help should never feel shameful. EveryGiving is designed so campaigners can tell their story with confidence, and donors can give in a way that honours the person receiving.',
              },
              {
                title: 'Radical transparency',
                accent: '#185FA5',
                body: 'Our fee structure is published publicly. Donors can see exactly how milestones work. Funds are never released without proof. If donors cannot see where their money goes, they will not give it.',
              },
              {
                title: 'Community first',
                accent: '#B85C00',
                body: 'We will not grow quickly at the expense of trust. Every campaign we verify, every payout we release, and every update we prompt are promises made to the communities that depend on us.',
              },
              {
                title: 'Built for everyone',
                accent: '#534AB7',
                body: 'Not just for smartphone users in Accra. Same-day MoMo payouts, diaspora corridors, and simple campaign pages — EveryGiving is designed to work for every Ghanaian, wherever they are.',
              },
            ].map((val, i) => (
              <div key={i} className="value-card">
                <div style={{ width: 4, height: 32, background: val.accent, borderRadius: 2, marginBottom: 16 }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A18', marginBottom: 12 }}>{val.title}</h3>
                <p style={{ fontSize: 14, color: '#4A4A44', lineHeight: 1.75 }}>{val.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOUNDER */}
      <div style={{ padding: '80px 32px', background: '#FFFFFF', borderTop: '1px solid #E8E4DC' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0A6B4B', marginBottom: 12 }}>
            The founder
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 34, color: '#1A1A18', marginBottom: 40 }}>
            Built by a Ghanaian, for Ghana
          </h2>
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#1A1A18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              JI
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1A1A18', marginBottom: 4 }}>Jeffery O. Impraim</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0A6B4B', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Founder</div>
              <p style={{ fontSize: 15, color: '#4A4A44', lineHeight: 1.8, maxWidth: 640 }}>
                Jeffery founded EveryGiving with a single conviction: that community giving in Ghana deserves
                a platform that is as trustworthy as a handshake and as modern as Mobile Money. Having seen
                first-hand how informal fundraising networks operate across communities, he set out to build
                infrastructure that brings those networks online — with identity verification, transparent
                milestones, and instant MoMo payouts at its core.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BUILT IN GHANA */}
      <div style={{ background: '#1A1A18', padding: '72px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#B7DEC9', marginBottom: 12 }}>
              Local commitment
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 34, color: '#fff', lineHeight: 1.2, marginBottom: 20 }}>
              Built in Ghana.<br />For Ghana.<br />By Ghana.
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 16 }}>
              Every product decision is made with a Ghanaian user in mind. Our payment infrastructure
              is designed around how Ghanaians actually move money — Mobile Money first, bank cards second.
            </p>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8 }}>
              EveryGiving is a Ghanaian company, built from the ground up for our own community.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { abbr: 'MoMo', label: 'Mobile Money First', sub: 'Designed around how Ghanaians actually move money' },
              { abbr: 'KYC', label: 'Identity Verified', sub: 'Every organizer verified using the Ghana Card system' },
              { abbr: 'GH+', label: 'Diaspora Ready', sub: 'Built to serve Ghanaians abroad as well as at home' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '16px 20px' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#B7DEC9', flexShrink: 0 }}>
                  {item.abbr}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PARTNERS */}
      <div style={{ padding: '64px 32px', borderTop: '1px solid #E8E4DC', background: '#FDFAF5' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A82', marginBottom: 32, textAlign: 'center' }}>
            Trusted partners
          </div>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { name: 'Paystack', role: 'MoMo & card payments', color: '#00C3F7' },
              { name: 'Hubtel', role: 'USSD & checkout', color: '#FF6600' },
              { name: 'Zeepay', role: 'Diaspora remittance', color: '#1A3C8F' },
            ].map((p, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 12, padding: '18px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 160 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A18' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#8A8A82', textAlign: 'center' }}>{p.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: '#0A6B4B', padding: '72px 32px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 38, color: '#fff', lineHeight: 1.2, marginBottom: 16 }}>
            Ready to make a difference?
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', marginBottom: 32, lineHeight: 1.75 }}>
            Whether you need to raise money or want to support a verified cause — EveryGiving is where you start.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/create" style={{ fontSize: 14, fontWeight: 700, color: '#0A6B4B', background: '#fff', padding: '14px 28px', borderRadius: 10, textDecoration: 'none' }}>
              Start a Campaign
            </Link>
            <Link href="/campaigns" style={{ fontSize: 14, fontWeight: 600, color: '#fff', padding: '14px 28px', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 10, textDecoration: 'none' }}>
              Browse Campaigns
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#111110', padding: '48px 32px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 24, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.07)', flexWrap: 'wrap', gap: 16 }}>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 19, color: '#fff' }}>
              Every<em style={{ color: '#B7DEC9', fontStyle: 'normal' }}>Giving</em>
            </span>
            <div style={{ display: 'flex', gap: 20 }}>
              {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact']].map(([label, href]) => (
                <Link key={href} href={href} style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
            &copy; {new Date().getFullYear()} EveryGiving Ltd · Accra, Ghana
          </div>
        </div>
      </footer>
    </>
  )
}
