/**
 * EveryGiving — Campaigner Dashboard
 * Route: /dashboard
 *
 * Sections:
 * 1. Top nav — authenticated state
 * 2. Welcome header + verification status banner
 * 3. Stats overview — total raised, active campaigns, donors, pending payouts
 * 4. My campaigns list — each with status, progress, quick actions
 * 5. Update prompt banner — day 3/7/14 nudge
 * 6. Recent donors feed
 * 7. Milestone payout tracker
 * 8. Notifications panel
 *
 * States modelled:
 * - New user (no campaigns yet) → onboarding empty state
 * - Pending verification → banner blocking campaign creation
 * - Active campaigner → full dashboard
 * - Funded campaign → celebration state
 *
 * Usage:
 *   // app/dashboard/page.js
 *   import Dashboard from '@/components/Dashboard';
 *   export default function Page() {
 *     return <Dashboard user={user} campaigns={campaigns} />;
 *   }
 */

'use client';

import { useState } from 'react';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_USER = {
  name: 'Kwame Mensah',
  initials: 'KM',
  phone: '024 123 4567',
  verificationStatus: 'verified', // 'not_submitted' | 'pending' | 'verified' | 'rejected'
  joinedDate: 'January 2026',
};

const MOCK_CAMPAIGNS = [
  {
    id: 'c1',
    title: 'Help Ama get life-saving kidney surgery at Korle Bu',
    category: 'medical',
    status: 'live',          // 'draft' | 'pending_verification' | 'live' | 'funded' | 'closed'
    goalGHS: 20000,
    raisedGHS: 14400,
    donorCount: 143,
    daysLeft: 12,
    lastUpdate: 3,            // days since last update
    milestones: [
      { id: 'm1', name: 'Hospital deposit', amountGHS: 5000, status: 'released' },
      { id: 'm2', name: 'Surgery fees', amountGHS: 12000, status: 'collecting' },
      { id: 'm3', name: 'Post-op care', amountGHS: 3000, status: 'pending' },
    ],
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=480&q=80&auto=format&fit=crop',
    slug: 'ama-kidney-surgery',
    createdAt: '2026-03-04',
    urgentAction: 'post_update', // 'post_update' | 'submit_proof' | 'verify_id' | null
  },
  {
    id: 'c2',
    title: 'School supplies for 120 children in Volta Region',
    category: 'education',
    status: 'funded',
    goalGHS: 4500,
    raisedGHS: 4500,
    donorCount: 54,
    daysLeft: 0,
    lastUpdate: 1,
    milestones: [
      { id: 'm4', name: 'Buy supplies', amountGHS: 4500, status: 'proof_submitted' },
    ],
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=480&q=80&auto=format&fit=crop',
    slug: 'esi-school-supplies',
    createdAt: '2026-02-10',
    urgentAction: 'submit_proof',
  },
];

const MOCK_DONORS = [
  { name: 'Efua Owusu', amount: 200, network: 'MTN MoMo', time: '2 min ago', campaign: 'Ama\'s surgery', isNew: true },
  { name: 'Kofi Asante', amount: 500, network: 'Vodafone Cash', time: '18 min ago', campaign: 'Ama\'s surgery', isNew: true },
  { name: 'Anonymous', amount: 100, network: 'MTN MoMo', time: '1 hr ago', campaign: 'Ama\'s surgery', isNew: false },
  { name: 'Abena Boateng', amount: 50, network: 'AirtelTigo', time: '3 hrs ago', campaign: 'Ama\'s surgery', isNew: false },
];

const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'donation', text: 'Kofi Asante donated ₵500 to Ama\'s surgery', time: '18 min ago', read: false },
  { id: 'n2', type: 'milestone', text: 'Milestone 1 (₵5,000 deposit) was released to your MTN MoMo', time: '2 days ago', read: false },
  { id: 'n3', type: 'update_prompt', text: 'It\'s been 3 days since your last update. Post one to re-engage donors', time: '1 hr ago', read: false },
  { id: 'n4', type: 'donation', text: 'Efua Owusu donated ₵200 to Ama\'s surgery', time: '2 min ago', read: true },
  { id: 'n5', type: 'system', text: 'Your Ghana Card verification was approved', time: '5 days ago', read: true },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function pct(raised, goal) { return Math.min(100, Math.round((raised / goal) * 100)); }
function fmt(n) { return n >= 1000 ? '₵' + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k' : '₵' + n.toLocaleString(); }

const STATUS_CONFIG = {
  draft:                 { label: 'Draft',          color: '#8A8A82', bg: '#F2F3F4' },
  pending_verification:  { label: 'Under review',   color: '#B85C00', bg: '#FEF3E2' },
  live:                  { label: 'Live',            color: '#0A6B4B', bg: '#E8F5EF' },
  funded:                { label: 'Funded',          color: '#185FA5', bg: '#E6F1FB' },
  closed:                { label: 'Closed',          color: '#4A4A44', bg: '#EAECEE' },
};

const ACTION_CONFIG = {
  post_update:  { label: 'Post an update', color: '#B85C00', bg: '#FEF3E2', icon: '📝' },
  submit_proof: { label: 'Submit milestone proof', color: '#185FA5', bg: '#E6F1FB', icon: '📄' },
  verify_id:    { label: 'Verify your identity', color: '#C0392B', bg: '#FCEBEB', icon: '🪪' },
};

const NOTIF_ICONS = {
  donation:      { icon: '₵', color: '#0A6B4B', bg: '#E8F5EF' },
  milestone:     { icon: '✓', color: '#185FA5', bg: '#E6F1FB' },
  update_prompt: { icon: '📝', color: '#B85C00', bg: '#FEF3E2' },
  system:        { icon: 'ℹ', color: '#534AB7', bg: '#EEEDFE' },
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={s.statCard}>
      <div style={{ ...s.statValue, color: accent || '#1A1A18' }}>{value}</div>
      <div style={s.statLabel}>{label}</div>
      {sub && <div style={s.statSub}>{sub}</div>}
    </div>
  );
}

function CampaignCard({ campaign, onAction }) {
  const p = pct(campaign.raisedGHS, campaign.goalGHS);
  const st = STATUS_CONFIG[campaign.status];
  const action = campaign.urgentAction ? ACTION_CONFIG[campaign.urgentAction] : null;
  const needsUpdate = campaign.lastUpdate >= 3 && campaign.status === 'live';

  return (
    <div style={s.campaignCard}>
      {/* Cover image + status */}
      <div style={s.campaignImgWrap}>
        <img
          src={campaign.image}
          alt={campaign.title}
          style={s.campaignImg}
        />
        <div style={{ ...s.statusBadge, color: st.color, background: st.bg }}>
          {st.label}
        </div>
        {campaign.daysLeft > 0 && campaign.daysLeft <= 5 && (
          <div style={s.urgencyBadge}>
            <span style={s.urgencyPulse} />
            {campaign.daysLeft}d left
          </div>
        )}
      </div>

      {/* Body */}
      <div style={s.campaignBody}>
        <div style={s.campaignCategory}>{campaign.category.toUpperCase()}</div>
        <div style={s.campaignTitle}>{campaign.title}</div>

        {/* Progress */}
        <div style={s.progressNumbers}>
          <span style={s.raisedAmt}>{fmt(campaign.raisedGHS)}</span>
          <span style={s.goalAmt}>of {fmt(campaign.goalGHS)} · {p}%</span>
        </div>
        <div style={s.progressTrack}>
          <div style={{
            ...s.progressFill,
            width: `${p}%`,
            background: campaign.status === 'funded' ? '#185FA5' : '#0A6B4B',
          }} />
        </div>
        <div style={s.campaignMeta}>
          <span>{campaign.donorCount} donors</span>
          {campaign.daysLeft > 0 && <span>{campaign.daysLeft} days left</span>}
          {campaign.daysLeft === 0 && <span>Campaign ended</span>}
        </div>

        {/* Update nudge */}
        {needsUpdate && (
          <div style={s.updateNudge}>
            <span style={s.nudgeIcon}>💬</span>
            <span style={s.nudgeText}>
              {campaign.lastUpdate} days since last update — donors are waiting
            </span>
          </div>
        )}

        {/* Urgent action */}
        {action && (
          <button
            style={{ ...s.actionBtn, color: action.color, background: action.bg }}
            onClick={() => onAction(campaign, campaign.urgentAction)}
          >
            {action.icon} {action.label} →
          </button>
        )}

        {/* Quick links */}
        <div style={s.quickLinks}>
          <a href={`/campaigns/${campaign.slug}`} style={s.quickLink}>View campaign</a>
          <a href={`/dashboard/campaigns/${campaign.id}/update`} style={s.quickLink}>Post update</a>
          <a href={`/dashboard/campaigns/${campaign.id}/edit`} style={s.quickLink}>Edit</a>
        </div>
      </div>
    </div>
  );
}

function MilestoneRow({ milestone, campaignTitle }) {
  const stConfig = {
    released:       { label: 'Released', color: '#0A6B4B', bg: '#E8F5EF' },
    collecting:     { label: 'Collecting', color: '#B85C00', bg: '#FEF3E2' },
    proof_submitted:{ label: 'Under review', color: '#185FA5', bg: '#E6F1FB' },
    pending:        { label: 'Pending', color: '#8A8A82', bg: '#F2F3F4' },
  };
  const st = stConfig[milestone.status] || stConfig.pending;

  return (
    <div style={s.milestoneRow}>
      <div style={{ ...s.msDot, background: milestone.status === 'released' ? '#0A6B4B' : milestone.status === 'collecting' ? '#B85C00' : '#E8E4DC', border: milestone.status === 'collecting' ? '2px solid #B85C00' : 'none' }} />
      <div style={s.msInfo}>
        <div style={s.msName}>{milestone.name}</div>
        <div style={s.msCampaign}>{campaignTitle}</div>
      </div>
      <div style={s.msAmt}>{fmt(milestone.amountGHS)}</div>
      <div style={{ ...s.msBadge, color: st.color, background: st.bg }}>{st.label}</div>
    </div>
  );
}

function NotifItem({ notif, onRead }) {
  const cfg = NOTIF_ICONS[notif.type] || NOTIF_ICONS.system;
  return (
    <div
      style={{ ...s.notifItem, background: notif.read ? 'transparent' : '#FDFAF5' }}
      onClick={() => onRead(notif.id)}
    >
      <div style={{ ...s.notifIcon, color: cfg.color, background: cfg.bg }}>{cfg.icon}</div>
      <div style={s.notifContent}>
        <div style={{ ...s.notifText, fontWeight: notif.read ? 400 : 500 }}>{notif.text}</div>
        <div style={s.notifTime}>{notif.time}</div>
      </div>
      {!notif.read && <div style={s.unreadDot} />}
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

function EmptyDashboard({ verificationStatus }) {
  return (
    <div style={s.emptyState}>
      <img
        src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80&auto=format&fit=crop"
        alt=""
        style={s.emptyImg}
      />
      <div style={s.emptyOverlay} />
      <div style={s.emptyContent}>
        <h2 style={s.emptyTitle}>Ready to raise?</h2>
        <p style={s.emptySub}>
          {verificationStatus === 'verified'
            ? 'Your identity is verified. Start your first campaign in under 15 minutes.'
            : 'Verify your identity first — it takes under 5 minutes and helps you raise 3× more.'}
        </p>
        <div style={s.emptyActions}>
          {verificationStatus === 'verified' ? (
            <a href="/create" style={s.emptyBtnP}>Start a campaign →</a>
          ) : (
            <a href="/verify" style={s.emptyBtnP}>Verify your identity →</a>
          )}
          <a href="/campaigns" style={s.emptyBtnS}>Browse campaigns</a>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────

export default function Dashboard({
  user = MOCK_USER,
  campaigns = MOCK_CAMPAIGNS,
  donors = MOCK_DONORS,
  notifications = MOCK_NOTIFICATIONS,
}) {
  const [notifs, setNotifs] = useState(notifications);
  const [activeSection, setActiveSection] = useState('campaigns');
  const [dashboardState, setDashboardState] = useState('active');
  // 'active' | 'empty' | 'pending_verification'

  const unreadCount = notifs.filter(n => !n.read).length;
  const totalRaised = campaigns.reduce((a, c) => a + c.raisedGHS, 0);
  const totalDonors = campaigns.reduce((a, c) => a + c.donorCount, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'live').length;
  const pendingPayouts = campaigns.flatMap(c => c.milestones).filter(m => m.status === 'proof_submitted').length;

  function markRead(id) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }

  function handleAction(campaign, action) {
    if (action === 'post_update') window.location.href = `/dashboard/campaigns/${campaign.id}/update`;
    if (action === 'submit_proof') window.location.href = `/dashboard/campaigns/${campaign.id}/milestones/${campaign.milestones.find(m => m.status === 'collecting')?.id}`;
  }

  const allMilestones = campaigns.flatMap(c =>
    c.milestones.map(m => ({ ...m, campaignTitle: c.title.slice(0, 30) + '…' }))
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#F5F4F0;color:#1A1A18}
        a{color:inherit;text-decoration:none}
        @keyframes fadeup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .cam-card-hover:hover{box-shadow:0 8px 24px rgba(0,0,0,.08);transform:translateY(-2px)}
        .quick-link-hover:hover{background:#E8F5EF;color:#0A6B4B}
        .notif-item-hover:hover{background:#F5F4F0}
        .nav-link-hover:hover{background:#F5F4F0;color:#1A1A18}
      `}</style>

      {/* ── AUTH NAV ── */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <a href="/" style={s.navLogo}>Every<span style={{ color: '#0A6B4B' }}>Giving</span></a>
          <div style={s.navDivider} />
          <span style={s.navSection}>Dashboard</span>
        </div>
        <div style={s.navRight}>
          <a href="/campaigns" style={s.navLink} className="nav-link-hover">Browse campaigns</a>
          <a href="/create" style={s.navCta}>
            + New campaign
          </a>
          {/* Notification bell */}
          <button style={s.notifBell} onClick={() => setActiveSection(s => s === 'notifications' ? 'campaigns' : 'notifications')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {unreadCount > 0 && <div style={s.bellBadge}>{unreadCount}</div>}
          </button>
          {/* Avatar */}
          <div style={s.avatar}>{user.initials}</div>
        </div>
      </nav>

      {/* ── VERIFICATION BANNER ── */}
      {user.verificationStatus === 'pending' && (
        <div style={s.verifyBanner}>
          <span style={s.verifyBannerText}>
            Your Ghana Card is under review — usually approved within 24 hours.
            Your campaign will go live automatically when approved.
          </span>
          <a href="/verify" style={s.verifyBannerLink}>Check status →</a>
        </div>
      )}
      {user.verificationStatus === 'rejected' && (
        <div style={{ ...s.verifyBanner, background: '#FCEBEB', borderColor: '#F0B0B0' }}>
          <span style={{ ...s.verifyBannerText, color: '#C0392B' }}>
            Your ID verification was unsuccessful. Please resubmit with a clearer photo.
          </span>
          <a href="/verify" style={{ ...s.verifyBannerLink, color: '#C0392B' }}>Resubmit →</a>
        </div>
      )}
      {user.verificationStatus === 'not_submitted' && (
        <div style={{ ...s.verifyBanner, background: '#FAEEDA', borderColor: '#F5CBA7' }}>
          <span style={{ ...s.verifyBannerText, color: '#B85C00' }}>
            Verify your identity to go live. Verified campaigns raise 3× more.
          </span>
          <a href="/verify" style={{ ...s.verifyBannerLink, color: '#B85C00' }}>Verify now →</a>
        </div>
      )}

      <div style={s.layout}>

        {/* ── SIDEBAR ── */}
        <aside style={s.sidebar}>
          <div style={s.sideUser}>
            <div style={s.sideAvatar}>{user.initials}</div>
            <div>
              <div style={s.sideUserName}>{user.name}</div>
              <div style={s.sideUserPhone}>{user.phone}</div>
            </div>
          </div>

          {user.verificationStatus === 'verified' && (
            <div style={s.verifiedChip}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#0A6B4B" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              Ghana Card Verified
            </div>
          )}

          <nav style={s.sideNav}>
            {[
              { id: 'campaigns', label: 'My campaigns', count: campaigns.length },
              { id: 'milestones', label: 'Milestones & payouts', count: pendingPayouts || null },
              { id: 'donors', label: 'Recent donors', count: null },
              { id: 'notifications', label: 'Notifications', count: unreadCount || null },
            ].map(item => (
              <button
                key={item.id}
                style={{
                  ...s.sideNavItem,
                  background: activeSection === item.id ? '#E8F5EF' : 'transparent',
                  color: activeSection === item.id ? '#0A6B4B' : '#4A4A44',
                  fontWeight: activeSection === item.id ? 600 : 400,
                }}
                onClick={() => setActiveSection(item.id)}
              >
                <span>{item.label}</span>
                {item.count > 0 && (
                  <span style={{ ...s.sideCount, background: activeSection === item.id ? '#0A6B4B' : '#E8E4DC', color: activeSection === item.id ? '#fff' : '#4A4A44' }}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div style={s.sideFooter}>
            <a href="/how-it-works" style={s.sideFooterLink}>How it works</a>
            <a href="/fees" style={s.sideFooterLink}>Fees</a>
            <a href="/auth/logout" style={{ ...s.sideFooterLink, color: '#C0392B' }}>Sign out</a>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main style={s.main}>

          {/* WELCOME + STATS */}
          <div style={s.welcomeRow}>
            <div>
              <h1 style={s.welcomeTitle}>Good morning, {user.name.split(' ')[0]}</h1>
              <p style={s.welcomeSub}>Here's how your campaigns are doing</p>
            </div>
            <a href="/create" style={s.newCampaignBtn}>+ Start new campaign</a>
          </div>

          <div style={s.statsGrid}>
            <StatCard label="Total raised" value={fmt(totalRaised)} sub="across all campaigns" accent="#0A6B4B" />
            <StatCard label="Active campaigns" value={activeCampaigns} sub={`${campaigns.length} total`} />
            <StatCard label="Total donors" value={totalDonors} sub="across all campaigns" />
            <StatCard label="Pending payouts" value={pendingPayouts} sub="milestones awaiting review" accent={pendingPayouts > 0 ? '#185FA5' : undefined} />
          </div>

          {/* ── CAMPAIGNS SECTION ── */}
          {activeSection === 'campaigns' && (
            <div style={{ animation: 'fadeup .25s ease both' }}>
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>My campaigns</h2>
                <a href="/create" style={s.sectionAction}>+ New campaign</a>
              </div>

              {campaigns.length === 0 ? (
                <EmptyDashboard verificationStatus={user.verificationStatus} />
              ) : (
                <div style={s.campaignGrid}>
                  {campaigns.map(c => (
                    <CampaignCard key={c.id} campaign={c} onAction={handleAction} />
                  ))}
                  {/* New campaign card */}
                  <a href="/create" style={s.newCampaignCard}>
                    <div style={s.newCampaignPlus}>+</div>
                    <div style={s.newCampaignLabel}>Start a new campaign</div>
                    <div style={s.newCampaignSub}>Free to create · verified by our team</div>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* ── MILESTONES SECTION ── */}
          {activeSection === 'milestones' && (
            <div style={{ animation: 'fadeup .25s ease both' }}>
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>Milestones & payouts</h2>
              </div>
              <div style={s.contentCard}>
                <div style={s.milestoneHeader}>
                  <span style={s.msColLabel}>Milestone</span>
                  <span style={s.msColLabel}>Amount</span>
                  <span style={s.msColLabel}>Status</span>
                </div>
                {allMilestones.map((m, i) => (
                  <MilestoneRow key={i} milestone={m} campaignTitle={m.campaignTitle} />
                ))}
              </div>
              <div style={s.payoutNote}>
                <strong>How payouts work:</strong> When a milestone amount is collected,
                submit proof (receipt, photo, or document) from your campaign page.
                Our team reviews within a few hours and releases funds to your MoMo wallet same day.
              </div>
            </div>
          )}

          {/* ── DONORS SECTION ── */}
          {activeSection === 'donors' && (
            <div style={{ animation: 'fadeup .25s ease both' }}>
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>Recent donors</h2>
                <span style={s.donorCount}>{totalDonors} total donors</span>
              </div>
              <div style={s.contentCard}>
                {donors.map((d, i) => (
                  <div key={i} style={{ ...s.donorRow, borderBottom: i < donors.length - 1 ? '1px solid #E8E4DC' : 'none' }}>
                    <div style={s.donorAv}>{d.name === 'Anonymous' ? '?' : d.name[0]}</div>
                    <div style={s.donorInfo}>
                      <div style={s.donorName}>
                        {d.name}
                        {d.isNew && <span style={s.newBadge}>New</span>}
                      </div>
                      <div style={s.donorMeta}>{d.network} · {d.campaign}</div>
                    </div>
                    <div style={s.donorAmount}>₵{d.amount.toLocaleString()}</div>
                    <div style={s.donorTime}>{d.time}</div>
                  </div>
                ))}
              </div>
              <div style={s.payoutNote}>
                Thank your donors with a personal update — it costs nothing and converts them into repeat givers.
                <a href={`/dashboard/campaigns/c1/update`} style={{ color: '#0A6B4B', fontWeight: 600, marginLeft: 6 }}>Post an update →</a>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS SECTION ── */}
          {activeSection === 'notifications' && (
            <div style={{ animation: 'fadeup .25s ease both' }}>
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>Notifications</h2>
                {unreadCount > 0 && (
                  <button style={s.markAllBtn} onClick={markAllRead}>Mark all read</button>
                )}
              </div>
              <div style={s.contentCard}>
                {notifs.map(n => (
                  <NotifItem key={n.id} notif={n} onRead={markRead} />
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const s = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 28px', height: 56, background: '#fff',
    borderBottom: '1px solid #E8E4DC', position: 'sticky', top: 0, zIndex: 100,
    fontFamily: "'DM Sans', sans-serif",
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  navLogo: { fontFamily: "'DM Serif Display', serif", fontSize: 18, color: '#1A1A18' },
  navDivider: { width: 1, height: 16, background: '#E8E4DC' },
  navSection: { fontSize: 13, color: '#8A8A82' },
  navRight: { display: 'flex', alignItems: 'center', gap: 8 },
  navLink: { fontSize: 13, color: '#8A8A82', padding: '6px 10px', borderRadius: 6, transition: 'all .15s' },
  navCta: {
    fontSize: 13, fontWeight: 600, color: '#fff', background: '#0A6B4B',
    padding: '7px 14px', borderRadius: 8,
  },
  notifBell: {
    position: 'relative', width: 34, height: 34, borderRadius: '50%',
    background: 'transparent', border: '1px solid #E8E4DC',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#4A4A44',
  },
  bellBadge: {
    position: 'absolute', top: -3, right: -3, width: 16, height: 16,
    borderRadius: '50%', background: '#C0392B', color: '#fff',
    fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  avatar: {
    width: 32, height: 32, borderRadius: '50%', background: '#0A6B4B',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer',
  },

  verifyBanner: {
    background: '#E8F5EF', borderBottom: '1px solid #B7DEC9',
    padding: '10px 28px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
  },
  verifyBannerText: { fontSize: 13, color: '#0A6B4B' },
  verifyBannerLink: { fontSize: 13, fontWeight: 600, color: '#0A6B4B', whiteSpace: 'nowrap' },

  layout: { display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 'calc(100vh - 56px)', alignItems: 'start' },

  sidebar: {
    background: '#fff', borderRight: '1px solid #E8E4DC',
    padding: '24px 16px', position: 'sticky', top: 56,
    height: 'calc(100vh - 56px)', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 0,
  },
  sideUser: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '0 4px' },
  sideAvatar: {
    width: 36, height: 36, borderRadius: '50%', background: '#0A6B4B',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
  },
  sideUserName: { fontSize: 13, fontWeight: 600, color: '#1A1A18' },
  sideUserPhone: { fontSize: 11, color: '#8A8A82', marginTop: 1 },
  verifiedChip: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: 11, fontWeight: 600, color: '#0A6B4B',
    background: '#E8F5EF', padding: '3px 9px', borderRadius: 20,
    marginBottom: 20, marginLeft: 4,
  },
  sideNav: { display: 'flex', flexDirection: 'column', gap: 2, flex: 1 },
  sideNavItem: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '9px 10px', borderRadius: 8, border: 'none',
    cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans', sans-serif",
    transition: 'all .15s', textAlign: 'left', width: '100%',
  },
  sideCount: {
    fontSize: 10, fontWeight: 700, padding: '2px 6px',
    borderRadius: 10, transition: 'all .15s',
  },
  sideFooter: { display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 16, borderTop: '1px solid #E8E4DC', marginTop: 16 },
  sideFooterLink: { fontSize: 12, color: '#8A8A82', padding: '6px 10px', borderRadius: 6 },

  main: { padding: '28px 28px 56px', maxWidth: 900 },

  welcomeRow: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    gap: 16, marginBottom: 24, flexWrap: 'wrap',
  },
  welcomeTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#1A1A18', marginBottom: 4 },
  welcomeSub: { fontSize: 13, color: '#8A8A82' },
  newCampaignBtn: {
    fontSize: 13, fontWeight: 600, color: '#fff', background: '#0A6B4B',
    padding: '10px 18px', borderRadius: 9, whiteSpace: 'nowrap',
  },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 },
  statCard: {
    background: '#fff', border: '1px solid #E8E4DC',
    borderRadius: 12, padding: '16px 18px',
  },
  statValue: { fontFamily: "'DM Serif Display', serif", fontSize: 28, lineHeight: 1, marginBottom: 6 },
  statLabel: { fontSize: 13, fontWeight: 500, color: '#1A1A18', marginBottom: 2 },
  statSub: { fontSize: 11, color: '#8A8A82' },

  sectionHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16, flexWrap: 'wrap', gap: 8,
  },
  sectionTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#1A1A18' },
  sectionAction: { fontSize: 13, fontWeight: 600, color: '#0A6B4B' },

  campaignGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 },
  campaignCard: {
    background: '#fff', border: '1px solid #E8E4DC', borderRadius: 14,
    overflow: 'hidden', transition: 'all .2s',
  },
  campaignImgWrap: { position: 'relative', height: 130, overflow: 'hidden' },
  campaignImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  statusBadge: {
    position: 'absolute', top: 8, right: 8, fontSize: 10, fontWeight: 700,
    padding: '2px 8px', borderRadius: 20,
  },
  urgencyBadge: {
    position: 'absolute', top: 8, left: 8, fontSize: 10, fontWeight: 700,
    color: '#B85C00', background: '#FEF3E2', padding: '2px 8px', borderRadius: 20,
    display: 'flex', alignItems: 'center', gap: 4,
  },
  urgencyPulse: {
    width: 5, height: 5, borderRadius: '50%', background: '#B85C00',
    animation: 'pulse 1.5s infinite',
  },
  campaignBody: { padding: 14 },
  campaignCategory: { fontSize: 9, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: '#0A6B4B', marginBottom: 4 },
  campaignTitle: { fontSize: 13, fontWeight: 600, color: '#1A1A18', lineHeight: 1.4, marginBottom: 12 },
  progressNumbers: { display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 5 },
  raisedAmt: { fontSize: 16, fontWeight: 700, color: '#1A1A18' },
  goalAmt: { fontSize: 11, color: '#8A8A82' },
  progressTrack: { height: 4, background: '#E8E4DC', borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 2, transition: 'width .6s ease' },
  campaignMeta: { display: 'flex', gap: 12, fontSize: 11, color: '#8A8A82', marginBottom: 10 },
  updateNudge: {
    display: 'flex', alignItems: 'flex-start', gap: 6,
    background: '#FEF3E2', borderRadius: 7, padding: '7px 9px', marginBottom: 8,
  },
  nudgeIcon: { fontSize: 12, flexShrink: 0 },
  nudgeText: { fontSize: 11, color: '#B85C00', lineHeight: 1.5 },
  actionBtn: {
    display: 'block', width: '100%', padding: '8px 10px', borderRadius: 7,
    fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
    textAlign: 'center', marginBottom: 8, fontFamily: "'DM Sans', sans-serif",
    transition: 'opacity .15s',
  },
  quickLinks: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  quickLink: {
    fontSize: 11, fontWeight: 500, color: '#4A4A44',
    background: '#F5F4F0', padding: '4px 8px', borderRadius: 5,
    transition: 'all .15s',
  },

  newCampaignCard: {
    border: '1.5px dashed #E8E4DC', borderRadius: 14, background: '#fff',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: 24, cursor: 'pointer',
    transition: 'all .15s', minHeight: 220, textDecoration: 'none',
  },
  newCampaignPlus: {
    fontSize: 28, color: '#0A6B4B', fontWeight: 300,
    width: 48, height: 48, border: '1.5px dashed #B7DEC9',
    borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', marginBottom: 12,
  },
  newCampaignLabel: { fontSize: 14, fontWeight: 600, color: '#1A1A18', marginBottom: 4 },
  newCampaignSub: { fontSize: 11, color: '#8A8A82', textAlign: 'center' },

  contentCard: {
    background: '#fff', border: '1px solid #E8E4DC',
    borderRadius: 14, overflow: 'hidden', marginBottom: 16,
  },

  milestoneHeader: {
    display: 'flex', gap: 12, padding: '10px 16px',
    background: '#F5F4F0', borderBottom: '1px solid #E8E4DC',
  },
  msColLabel: { fontSize: 10, fontWeight: 700, color: '#8A8A82', letterSpacing: '.06em', textTransform: 'uppercase', flex: 1 },
  milestoneRow: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
    borderBottom: '1px solid #E8E4DC',
  },
  msDot: { width: 12, height: 12, borderRadius: '50%', flexShrink: 0 },
  msInfo: { flex: 1, minWidth: 0 },
  msName: { fontSize: 13, fontWeight: 500, color: '#1A1A18' },
  msCampaign: { fontSize: 11, color: '#8A8A82', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  msAmt: { fontSize: 13, fontWeight: 600, color: '#1A1A18', flexShrink: 0 },
  msBadge: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, flexShrink: 0 },

  payoutNote: {
    background: '#fff', border: '1px solid #E8E4DC', borderRadius: 10,
    padding: '12px 16px', fontSize: 13, color: '#4A4A44', lineHeight: 1.65,
  },

  donorRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px' },
  donorAv: {
    width: 32, height: 32, borderRadius: '50%', background: '#E8F5EF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, color: '#0A6B4B', flexShrink: 0,
  },
  donorInfo: { flex: 1, minWidth: 0 },
  donorName: { fontSize: 13, fontWeight: 500, color: '#1A1A18', display: 'flex', alignItems: 'center', gap: 6 },
  donorMeta: { fontSize: 11, color: '#8A8A82', marginTop: 1 },
  newBadge: {
    fontSize: 10, fontWeight: 700, color: '#fff',
    background: '#0A6B4B', padding: '1px 6px', borderRadius: 10,
  },
  donorAmount: { fontSize: 14, fontWeight: 600, color: '#1A1A18', flexShrink: 0 },
  donorTime: { fontSize: 11, color: '#8A8A82', flexShrink: 0, minWidth: 50, textAlign: 'right' },
  donorCount: { fontSize: 13, color: '#8A8A82' },

  notifItem: {
    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px',
    borderBottom: '1px solid #E8E4DC', cursor: 'pointer', transition: 'background .15s',
  },
  notifIcon: {
    width: 28, height: 28, borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: 12,
    fontWeight: 700, flexShrink: 0,
  },
  notifContent: { flex: 1 },
  notifText: { fontSize: 13, color: '#1A1A18', lineHeight: 1.5 },
  notifTime: { fontSize: 11, color: '#8A8A82', marginTop: 2 },
  unreadDot: {
    width: 7, height: 7, borderRadius: '50%',
    background: '#0A6B4B', flexShrink: 0, marginTop: 5,
  },
  markAllBtn: {
    fontSize: 12, fontWeight: 600, color: '#0A6B4B', background: 'none',
    border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
  },

  emptyState: { position: 'relative', borderRadius: 16, overflow: 'hidden', height: 320 },
  emptyImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  emptyOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,8,.85), rgba(10,10,8,.3))' },
  emptyContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 28px' },
  emptyTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#fff', marginBottom: 8 },
  emptySub: { fontSize: 14, color: 'rgba(255,255,255,.65)', lineHeight: 1.65, marginBottom: 20, maxWidth: 440 },
  emptyActions: { display: 'flex', gap: 10 },
  emptyBtnP: { fontSize: 13, fontWeight: 600, color: '#fff', background: '#0A6B4B', padding: '10px 20px', borderRadius: 8 },
  emptyBtnS: { fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.7)', background: 'rgba(255,255,255,.1)', padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,.2)' },
};
