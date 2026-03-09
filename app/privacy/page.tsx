import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const LAST_UPDATED = 'March 2026'

const sections = [
  {
    id: 'overview',
    title: '1. Who We Are & What This Policy Covers',
    content: `EveryGiving ("we", "us", "our") operates the crowdfunding platform at everygiving.org. We are committed to protecting the personal data of everyone who uses our Platform — whether you are a fundraiser, donor, or visitor.

This Privacy Policy explains:
• What personal data we collect and why
• How we use, store, and protect your data
• Who we share your data with
• Your rights under the Ghana Data Protection Act, 2012 (Act 843)
• How to contact us with privacy concerns

By using EveryGiving, you consent to the practices described in this policy.`,
  },
  {
    id: 'data-collected',
    title: '2. Data We Collect',
    content: `We collect the following categories of personal data:

Account data
• Full name, email address, phone number
• Password (stored in encrypted form — we never see it in plain text)

Campaign & identity data (fundraisers)
• Ghana Card, Passport, Driver's Licence, Voter's ID, NHIS Card, or other government-issued ID
• ID number, photo of your identity document, selfie photograph
• Campaign title, story, goal amount, category, and updates

Donation data (donors)
• Name (or "Anonymous" if chosen), email address
• Donation amount, tip amount, message to fundraiser
• Payment method (MTN MoMo, Vodafone Cash, AirtelTigo, bank, card)

Technical data
• IP address, browser type, device type
• Pages visited, time on site, referral source
• Cookies and similar tracking technologies (see Section 7)

We do not collect your MoMo PIN, bank account passwords, or any payment credentials. These are handled directly by Hubtel, our licensed payment processor.`,
  },
  {
    id: 'how-used',
    title: '3. How We Use Your Data',
    content: `We use your personal data to:

• Create and manage your account
• Review and approve campaigns (identity verification is done manually by our team)
• Process donations and release funds to fundraisers via milestone payouts
• Send you transactional emails (campaign confirmation, approval notification, donation receipts)
• Respond to support requests and enquiries
• Detect and prevent fraud or misuse of the Platform
• Comply with legal obligations under Ghanaian law
• Improve the Platform through analytics

We do not use your data for advertising. We do not sell your data to third parties.`,
  },
  {
    id: 'identity-verification',
    title: '4. Identity Verification & Document Handling',
    content: `When you submit a campaign, you upload an identity document (and selfie, for Standard tier and above). This data is used solely to verify your identity before your campaign goes live.

How we handle your documents:
• Documents are uploaded to secure, encrypted storage (Supabase)
• They are reviewed manually by our team
• They are never shared with donors or any third party
• They are retained for as long as your account is active and for a reasonable period after closure to comply with legal obligations
• You may request deletion at any time by contacting business@everygiving.org

We do not use automated decision-making or profiling for identity verification. All verification decisions are made by a human member of our team.`,
  },
  {
    id: 'sharing',
    title: '5. Who We Share Data With',
    content: `We share personal data only where necessary and with the following categories of recipients:

Hubtel (payment processing)
Our licensed payment processor, regulated by the Bank of Ghana. Hubtel handles all mobile money, bank transfer, and card transactions. They receive transaction data needed to process payments and release milestone payouts.

Brevo (email delivery)
We use Brevo to send transactional emails (confirmations, approvals, receipts). Brevo receives your email address and name for this purpose only.

Supabase (data storage)
Our database and file storage provider. All data is encrypted at rest and in transit.

Legal authorities
We may disclose your data if required to do so by Ghanaian law, a court order, or a regulatory authority.

We do not share your data with advertisers, data brokers, or any third parties for marketing purposes.`,
  },
  {
    id: 'retention',
    title: '6. Data Retention',
    content: `We retain your personal data for as long as your account is active. If you close your account, we will delete or anonymise your personal data within 90 days, except where we are required to retain it by law.

Identity documents (ID photos, selfies) are retained for as long as your account is active. You may request early deletion by contacting us — we will action all such requests within 30 days.

Donation records are retained for 7 years to comply with Ghanaian financial record-keeping requirements.`,
  },
  {
    id: 'cookies',
    title: '7. Cookies & Tracking',
    content: `We use cookies and similar technologies to:
• Keep you logged in to your account
• Remember your preferences
• Analyse how the Platform is used (via anonymised analytics)

We do not use advertising cookies or share tracking data with advertisers.

You can disable cookies in your browser settings, but some features of the Platform may not work correctly if you do.`,
  },
  {
    id: 'security',
    title: '8. Security',
    content: `We take the security of your data seriously. Our security measures include:

• All data transmitted between your browser and our servers is encrypted using TLS/HTTPS
• Passwords are hashed using industry-standard encryption — we never store or see plain-text passwords
• Identity documents are stored in encrypted, access-controlled storage
• Access to personal data is restricted to authorised team members only
• We use Supabase Row Level Security (RLS) to enforce data access controls at the database level

No security system is completely impenetrable. If you believe your account has been compromised, please contact us immediately at business@everygiving.org.`,
  },
  {
    id: 'rights',
    title: '9. Your Rights Under the Ghana Data Protection Act',
    content: `Under the Ghana Data Protection Act, 2012 (Act 843), you have the right to:

• Access — request a copy of the personal data we hold about you
• Correction — ask us to correct inaccurate or incomplete data
• Deletion — ask us to delete your personal data (subject to legal retention requirements)
• Objection — object to how we use your data in certain circumstances
• Portability — request your data in a machine-readable format

To exercise any of these rights, contact us at business@everygiving.org. We will respond within 30 days. We may need to verify your identity before actioning your request.

If you are not satisfied with how we handle your request, you may lodge a complaint with the Data Protection Commission of Ghana.`,
  },
  {
    id: 'children',
    title: '10. Children',
    content: `EveryGiving is not intended for use by anyone under the age of 18. We do not knowingly collect personal data from minors.

If you believe a minor has submitted data to us, please contact us at business@everygiving.org and we will delete it promptly.`,
  },
  {
    id: 'changes',
    title: '11. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. When we make material changes, we will notify registered users by email and update the "Last updated" date at the top of this page.

Continued use of the Platform after any changes constitutes your acceptance of the updated policy.`,
  },
  {
    id: 'contact',
    title: '12. Contact & Data Controller',
    content: `EveryGiving is the data controller for your personal data.

If you have any questions, requests, or concerns about this Privacy Policy or how we handle your data:

Email: business@everygiving.org
Platform: everygiving.org/contact
Address: Accra, Ghana

We aim to respond to all privacy requests within 30 days.`,
  },
]

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="bg-navy py-16 px-5">
          <div className="max-w-3xl mx-auto">
            <div className="inline-block bg-primary/15 border border-primary/30 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-5">Legal</div>
            <h1 className="font-nunito font-black text-white text-4xl md:text-5xl tracking-tight mb-4" style={{ letterSpacing: -1 }}>
              Privacy Policy
            </h1>
            <p className="text-white/40 text-sm">Last updated: {LAST_UPDATED}</p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-5 py-12 grid md:grid-cols-4 gap-10">

          {/* Sidebar nav */}
          <aside className="hidden md:block md:col-span-1">
            <div className="sticky top-24">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Sections</p>
              <nav className="flex flex-col gap-1">
                {sections.map(s => (
                  <a key={s.id} href={`#${s.id}`}
                    className="text-xs text-gray-500 hover:text-primary transition-colors py-1 leading-snug">
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="md:col-span-3">
            <div className="bg-primary-light border border-primary/20 rounded-2xl p-5 mb-10 text-sm text-primary-dark">
              <strong>Your privacy matters to us.</strong> EveryGiving is committed to protecting your personal data and complying with the Ghana Data Protection Act, 2012 (Act 843). We do not sell your data. We do not show you ads.
            </div>

            <div className="flex flex-col gap-10">
              {sections.map(section => (
                <div key={section.id} id={section.id} className="scroll-mt-24">
                  <h2 className="font-nunito font-black text-navy text-xl mb-4 pb-3 border-b border-gray-100">
                    {section.title}
                  </h2>
                  <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 bg-navy rounded-2xl p-8 text-center">
              <div className="font-nunito font-black text-white text-xl mb-2">Want to access or delete your data?</div>
              <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
                Email us and we will respond within 30 days. Include your full name and registered email address.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a href="mailto:business@everygiving.org?subject=Privacy Request"
                  className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black text-sm px-7 py-3 rounded-full transition-all hover:-translate-y-0.5">
                  Email a privacy request →
                </a>
                <Link href="/contact"
                  className="inline-block border-2 border-white/20 hover:border-primary text-white/70 hover:text-white font-bold text-sm px-7 py-3 rounded-full transition-all">
                  Contact page
                </Link>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10 flex justify-center gap-4 text-xs text-white/30">
                <Link href="/terms" className="hover:text-primary transition-colors">Terms &amp; Conditions</Link>
                <span>·</span>
                <Link href="/create" className="hover:text-primary transition-colors">Start a campaign</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
