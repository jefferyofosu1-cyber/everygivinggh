'use client'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const LAST_UPDATED = 'March 2026'

const sections = [
  {
    id: 'overview',
    title: '1. Who We Are & What This Policy Covers',
    content: `Every Giving ("we", "us", "our") operates the crowdfunding platform at everygiving.org. We are committed to protecting the personal data of everyone who uses our Platform — whether you are a fundraiser, donor, or visitor.

This Privacy Policy explains:
• What personal data we collect and why
• How we use, store, and protect your data
• Who we share your data with
• Your rights under the Ghana Data Protection Act, 2012 (Act 843)
• How to contact us with privacy concerns

This policy applies to all users of everygiving.org and our associated services. By using our Platform, you consent to the practices described in this policy.

If you have questions, contact our Data Controller at: business@everygiving.org`,
  },
  {
    id: 'data-collected',
    title: '2. Data We Collect',
    content: `We collect different types of data depending on how you use our Platform.

ACCOUNT DATA (collected when you register):
• Full name
• Email address
• Phone number (mobile money number)
• Password (stored as an encrypted hash — never in plain text)
• Date of registration

IDENTITY VERIFICATION DATA (collected when you verify as a fundraiser):
• Ghana Card number
• Date of birth
• A photo of your Ghana Card (front and back)
• A biometric selfie image for facial matching
• National Identification Authority (NIA) verification result

CAMPAIGN DATA (collected when you create a campaign):
• Campaign title, story, and photos you upload
• Fundraising goal amount
• Campaign category
• Updates and messages you post

PAYMENT & TRANSACTION DATA:
• Donation amounts received
• Payout records to your mobile money account
• Transaction timestamps and reference numbers
• Note: We do not store full mobile money PINs or card numbers

USAGE DATA (collected automatically):
• IP address and approximate location
• Browser type and device information
• Pages visited and time spent on the Platform
• Referral source (e.g. how you found us)
• Cookies and similar tracking technologies (see Section 9)

COMMUNICATIONS DATA:
• Emails and messages you send to our support team
• Campaign update messages you post to donors`,
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Your Data',
    content: `We use your personal data only for legitimate purposes. Here is exactly what we do with each type:

Account data → To create and manage your account, send you important platform notices, and allow you to log in securely.

Identity verification data → To verify your identity against the NIA database via our third-party verification partner. This confirms the authenticity of fundraisers and builds donor trust.

Campaign data → To display your campaign publicly on the Platform, allow donors to find and support your cause, and enable you to post updates.

Payment data → To process donations, send payouts to your registered mobile money account, and maintain accurate financial records as required by law.

Usage data → To improve Platform performance, fix bugs, understand how users navigate the site, and detect fraudulent or suspicious activity.

Communications data → To respond to your support requests and improve our customer service.

Email address → To send you transactional emails (welcome, payout notifications, campaign updates). We may also send you occasional platform news and tips. You can unsubscribe at any time.

We do not use your data for automated decision-making that significantly affects you without human review.`,
  },
  {
    id: 'legal-basis',
    title: '4. Legal Basis for Processing',
    content: `Under the Ghana Data Protection Act, 2012 (Act 843), we process your personal data on the following legal bases:

CONTRACT — Processing necessary to provide you with the services you signed up for (account management, campaign hosting, payouts).

CONSENT — Where you have given clear consent, such as agreeing to receive marketing emails. You may withdraw consent at any time.

LEGAL OBLIGATION — Where we are required by Ghanaian law to retain or disclose data, for example for anti-money laundering compliance or when responding to a lawful court order.

LEGITIMATE INTERESTS — Where processing is necessary for our legitimate business interests, such as fraud prevention, platform security, and improving our service, provided these interests do not override your rights.

We only collect the minimum data necessary for each purpose (data minimisation principle).`,
  },
  {
    id: 'sharing',
    title: '5. Who We Share Your Data With',
    content: `We do not sell your personal data to any third party. Ever.

We share data only with the following categories of trusted service providers, and only to the extent necessary:

IDENTITY VERIFICATION PARTNER
We use a third-party identity verification service to match your selfie against your Ghana Card and cross-check with the NIA database. They process your identity documents under a data processing agreement with us. Your identity data is used solely for verification and is not retained by them beyond the period required for the verification process.

PAYMENT PROCESSOR
To process donations and send payouts to mobile money wallets, we share transaction data with our licensed payment provider. They are bound by Ghanaian financial regulation and their own privacy policies.

EMAIL SERVICE PROVIDER (BREVO)
We use Brevo to send transactional and marketing emails. Your name and email address are stored in Brevo under our account. Brevo does not use your data for their own marketing purposes.

HOSTING & INFRASTRUCTURE (VERCEL / SUPABASE)
Our Platform is hosted on Vercel and our database runs on Supabase. Your data is stored on their secure servers. Both providers operate under strict data protection standards.

LAW ENFORCEMENT & REGULATORY AUTHORITIES
We may disclose personal data to the Ghana Police Service, the Economic and Organised Crime Office (EOCO), or other competent authorities if required by law, court order, or to protect the safety of our users.

All third-party providers are required to handle your data securely and in accordance with applicable data protection law.`,
  },
  {
    id: 'identity-data',
    title: '6. Identity Document Data — Special Notice',
    content: `Because we process sensitive identity documents (Ghana Card images and biometric selfies), we want to be especially transparent about how this data is handled.

• Your Ghana Card image and selfie are transmitted securely to our verification partner using encrypted connections (TLS/HTTPS)
• Verification is processed automatically — no Every Giving employee views your documents during a standard verification
• Your raw identity images are not stored permanently on our servers after verification is complete
• The verification result (Verified / Not Verified) and your NIA-confirmed name and ID number are stored in your account record
• We retain this data to prevent duplicate account creation and to maintain a verifiable audit trail

If you request account deletion, we will delete your identity data subject to any legal retention requirements (see Section 10).

We treat identity document data as highly sensitive and apply the strictest access controls to this information within our organisation.`,
  },
  {
    id: 'public-data',
    title: '7. Public Information on Campaign Pages',
    content: `When you create a campaign on Every Giving, the following information is displayed publicly:

• Your first name and last initial (e.g. "Ama M.")
• Your Verified badge status
• Your campaign story, photos, and updates
• Your fundraising goal and amount raised
• The number of donors (donor names are shown unless they chose to donate anonymously)

Please be mindful of what personal information you include in your campaign story and photos. Information you share publicly on your campaign page is accessible to anyone who visits the Platform, including people who find it via search engines.

Donors who choose to give anonymously will have their name replaced with "Anonymous Donor" on the public campaign page. Their identity is still recorded in our system for fraud prevention purposes.`,
  },
  {
    id: 'data-retention',
    title: '8. How Long We Keep Your Data',
    content: `We retain your data only for as long as necessary for the purposes described in this policy.

Active accounts → Data retained for the lifetime of your account plus 12 months after account closure.

Campaign data → Campaign pages and associated data are retained for 3 years after a campaign ends, to allow donors to reference their giving history.

Identity verification data → Retained for 5 years after account closure to comply with anti-money laundering obligations and to prevent re-registration by fraudulent actors.

Transaction records → Retained for 7 years in accordance with Ghanaian financial record-keeping requirements.

Support communications → Retained for 2 years after the issue is resolved.

Usage and analytics data → Anonymised and retained indefinitely for platform improvement purposes.

When data is no longer required, it is securely deleted or anonymised so it can no longer be linked to you.`,
  },
  {
    id: 'cookies',
    title: '9. Cookies & Tracking',
    content: `We use cookies and similar technologies to make the Platform work and to improve your experience.

ESSENTIAL COOKIES (always active):
• Session cookies to keep you logged in
• Security cookies to protect against CSRF attacks
• Preference cookies to remember your settings

ANALYTICS COOKIES (with your consent):
• We use anonymised analytics to understand how users navigate the Platform and where we can improve. We do not use invasive tracking or sell advertising data.

We do not use third-party advertising cookies or allow ad networks to track you across the web via our Platform.

You can manage cookie preferences in your browser settings. Disabling essential cookies may prevent the Platform from functioning correctly.`,
  },
  {
    id: 'your-rights',
    title: '10. Your Rights Under the Ghana Data Protection Act',
    content: `Under the Ghana Data Protection Act, 2012 (Act 843), you have the following rights regarding your personal data:

RIGHT TO ACCESS — You may request a copy of the personal data we hold about you at any time.

RIGHT TO CORRECTION — You may ask us to correct any inaccurate or incomplete data we hold about you.

RIGHT TO DELETION — You may request that we delete your personal data. We will comply unless we are required to retain it by law (e.g. financial records, fraud prevention).

RIGHT TO OBJECT — You may object to certain types of processing, including direct marketing emails. You can unsubscribe from marketing emails at any time using the link in any email we send.

RIGHT TO DATA PORTABILITY — You may request your account data in a machine-readable format.

RIGHT TO WITHDRAW CONSENT — Where processing is based on your consent, you may withdraw that consent at any time without affecting the lawfulness of processing before withdrawal.

To exercise any of these rights, contact us at: business@everygiving.org

We will respond to all data rights requests within 30 days. We may need to verify your identity before processing your request.

If you believe we have not handled your data lawfully, you have the right to lodge a complaint with the Data Protection Commission of Ghana (dataprotection.org.gh).`,
  },
  {
    id: 'security',
    title: '11. How We Protect Your Data',
    content: `We take the security of your personal data seriously and implement the following measures:

• All data transmitted between your device and our Platform is encrypted using TLS (HTTPS)
• Passwords are hashed using industry-standard algorithms and never stored in plain text
• Access to personal data within our organisation is restricted to authorised personnel on a need-to-know basis
• Our database and servers are hosted on industry-leading infrastructure (Supabase / Vercel) with enterprise-grade security controls
• We conduct regular reviews of our security practices
• Identity documents are handled with additional access controls and encryption at rest

No system is completely immune to security threats. In the event of a data breach that is likely to result in a risk to your rights and freedoms, we will notify affected users and the Data Protection Commission of Ghana within 72 hours of becoming aware of the breach, as required by law.`,
  },
  {
    id: 'children',
    title: '12. Children\'s Privacy',
    content: `Every Giving is not intended for use by persons under the age of 18. We do not knowingly collect personal data from children under 18.

If you are a parent or guardian and believe your child has registered on our Platform, please contact us immediately at business@everygiving.org. We will promptly delete the account and all associated data.`,
  },
  {
    id: 'changes',
    title: '13. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements.

When we make significant changes, we will:
• Update the "Last updated" date at the top of this page
• Send a notification email to all registered users
• Display a prominent notice on the Platform for 30 days

We encourage you to review this policy periodically. Continued use of the Platform after changes are posted constitutes your acceptance of the updated policy.`,
  },
  {
    id: 'contact',
    title: '14. Contact & Data Controller',
    content: `Every Giving is the Data Controller responsible for your personal data under the Ghana Data Protection Act, 2012.

For all privacy-related enquiries, requests, or complaints:

Email: business@everygiving.org
Website: everygiving.org
Subject line: "Privacy Request — [your name]"

We aim to respond to all privacy enquiries within 5 business days.

If you are not satisfied with our response, you may escalate your complaint to:

Data Protection Commission of Ghana
Website: dataprotection.org.gh`,
  },
]

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main>

        {/* ── HEADER ── */}
        <div className="bg-navy relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative max-w-3xl mx-auto px-5 py-16 md:py-20">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-widest uppercase">
              Legal
            </div>
            <h1 className="font-nunito font-black text-white text-3xl md:text-5xl tracking-tight mb-4 leading-tight">
              Privacy Policy
            </h1>
            <p className="text-white/40 text-sm leading-relaxed max-w-xl">
              Your privacy matters to us. This policy explains exactly what data we collect, why we collect it, and how we protect it — written in plain language.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/25">
              <span>Last updated: {LAST_UPDATED}</span>
              <span>·</span>
              <span>Governed by: Ghana Data Protection Act, 2012 (Act 843)</span>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="max-w-3xl mx-auto px-5 py-16">

          {/* Quick nav */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-12">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4" style={{ fontFamily: 'DM Mono, monospace' }}>Contents</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {sections.map(s => (
                <a key={s.id} href={`#${s.id}`}
                  className="text-sm text-gray-500 hover:text-primary transition-colors py-1 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-gray-300 group-hover:bg-primary rounded-full transition-colors flex-shrink-0" />
                  {s.title}
                </a>
              ))}
            </div>
          </div>

          {/* Plain English Summary */}
          <div className="bg-primary-light border border-primary/15 rounded-2xl p-6 mb-12">
            <div className="font-nunito font-black text-navy text-lg mb-3">Plain English Summary</div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: '🔒', title: 'We never sell your data', desc: 'Your personal information is never sold to advertisers or third parties.' },
                { icon: '🇬🇭', title: 'Ghana law applies', desc: 'We comply with the Ghana Data Protection Act 2012. Your rights are protected.' },
                { icon: '✉️', title: 'You stay in control', desc: 'You can access, correct, or delete your data by emailing us at any time.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <div className="font-nunito font-extrabold text-navy text-sm mb-1">{item.title}</div>
                    <div className="text-xs text-gray-500 leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-10">
            {sections.map((section, i) => (
              <div key={section.id} id={section.id} className="scroll-mt-24">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary font-black text-xs">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h2 className="font-nunito font-black text-navy text-xl tracking-tight leading-tight pt-0.5">{section.title}</h2>
                </div>
                <div className="pl-12">
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
                {i < sections.length - 1 && <div className="mt-10 h-px bg-gray-100" />}
              </div>
            ))}
          </div>

          {/* Data rights CTA */}
          <div className="mt-16 bg-navy rounded-2xl p-8 text-center">
            <div className="font-nunito font-black text-white text-xl mb-2">Want to access or delete your data?</div>
            <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
              Email us and we'll respond within 5 business days. Include your full name and registered email address.
            </p>
            <a href="mailto:business@everygiving.org?subject=Privacy Request"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black text-sm px-7 py-3 rounded-full transition-all hover:-translate-y-0.5">
              Email us — business@everygiving.org
            </a>
          </div>

          {/* Related links */}
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="/terms" className="text-sm text-gray-400 hover:text-primary transition-colors">Terms &amp; Conditions</Link>
            <span className="text-gray-200">·</span>
            <Link href="/how-it-works" className="text-sm text-gray-400 hover:text-primary transition-colors">How it works</Link>
            <span className="text-gray-200">·</span>
            <Link href="/create" className="text-sm text-gray-400 hover:text-primary transition-colors">Start a campaign</Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
