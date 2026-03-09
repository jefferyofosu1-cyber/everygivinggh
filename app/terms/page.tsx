'use client'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const LAST_UPDATED = 'March 2026'

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing or using the Every Giving platform at everygiving.org ("Platform"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you may not use the Platform.

These Terms constitute a legally binding agreement between you and Every Giving ("we", "us", "our"), a platform operated in Ghana. By creating an account, starting a campaign, or making a donation, you confirm that you have read, understood, and accepted these Terms.

We reserve the right to update these Terms at any time. Continued use of the Platform after any changes constitutes your acceptance of the new Terms.`,
  },
  {
    id: 'eligibility',
    title: '2. Eligibility',
    content: `To use Every Giving you must:

• Be at least 18 years of age
• Be a resident of Ghana or have a valid Ghana Card
• Provide accurate and truthful information during registration
• Have a valid mobile money account (MTN MoMo, Vodafone Cash, or AirtelTigo Money)
• Not have been previously suspended or removed from the Platform

By using the Platform, you represent and warrant that you meet all of the above eligibility requirements.`,
  },
  {
    id: 'accounts',
    title: '3. User Accounts',
    content: `When you create an account on Every Giving, you are responsible for:

• Maintaining the confidentiality of your password and account credentials
• All activity that occurs under your account
• Notifying us immediately of any unauthorised use of your account at business@everygiving.org

You may not create an account on behalf of another person without their express written consent. You may not use another person's account without their permission.

We reserve the right to suspend or terminate accounts that violate these Terms, provide false information, or engage in fraudulent activity.`,
  },
  {
    id: 'verification',
    title: '4. Identity Verification',
    content: `Every Giving requires identity verification for all fundraisers. This process involves:

• Uploading a valid Ghana Card (National Identification Card)
• Completing a biometric selfie check matched against your Ghana Card
• Cross-referencing your details with the National Identification Authority (NIA) database

Verification is processed through our third-party identity verification partner. By submitting your identity documents, you consent to this data being processed for verification purposes.

A "Verified" badge is displayed on your campaign only after successful verification. Donors can see this badge as a signal of authenticity. Every Giving does not guarantee the accuracy of the NIA database and is not liable for errors in the verification process outside of our control.

Providing false, stolen, or altered identity documents is a criminal offence under Ghanaian law and will result in immediate account termination and referral to the appropriate authorities.`,
  },
  {
    id: 'campaigns',
    title: '5. Campaigns & Fundraising',
    content: `Fundraisers agree to the following when creating a campaign:

Permitted campaigns include:
• Medical bills and healthcare costs
• Educational fees and school expenses
• Emergency and disaster relief
• Community and church projects
• Business and livelihood support
• Memorial and funeral costs

Prohibited campaigns include:
• Any illegal activity or purpose
• Campaigns that promote violence, hate speech, or discrimination
• Fundraising for political parties or electoral campaigns
• Campaigns that are deceptive, misleading, or fraudulent
• Campaigns designed to circumvent Ghanaian law or regulations

You are solely responsible for the content of your campaign, including the accuracy of your story, the legitimacy of your stated purpose, and the appropriate use of donated funds.

Every Giving reserves the right to remove any campaign at any time without prior notice if it violates these Terms or is flagged for suspicious activity.`,
  },
  {
    id: 'fees',
    title: '6. Fees & Payments',
    content: `Every Giving charges zero platform fees on donations. This means:

• We do not deduct any percentage from donations made to your campaign
• 100% of every donor's contribution is passed to the fundraiser
• There are no withdrawal fees charged by Every Giving

However, please note:
• Mobile money network operators (MTN, Vodafone, AirtelTigo) may charge their standard transaction fees for transfers. These fees are set by the networks and are outside our control.
• Payment processing fees charged by our payment provider may apply and will be displayed clearly before any transaction is confirmed.

Every Giving reserves the right to introduce optional paid services or premium features in the future. Any such changes will be communicated with at least 30 days' notice and will never affect the 0% platform fee on donations.`,
  },
  {
    id: 'payouts',
    title: '7. Withdrawals & Payouts',
    content: `Funds donated to your campaign are disbursed to your registered mobile money wallet. By using the Platform, you agree that:

• Payouts are sent to the mobile money number you registered at signup
• You are responsible for ensuring your mobile money account details are accurate
• Every Giving is not liable for funds sent to an incorrect number provided by you
• Payouts are typically processed on the same day donations are received, subject to payment provider processing times
• We reserve the right to place a hold on payouts if we have reasonable suspicion of fraud, a chargeback dispute, or a violation of these Terms
• In cases of verified fraud, we reserve the right to reverse transactions where technically possible and legally required`,
  },
  {
    id: 'donors',
    title: '8. Donors & Donations',
    content: `By making a donation on Every Giving, you acknowledge and agree that:

• Donations are voluntary contributions to individual fundraisers and are not purchases of goods or services
• Every Giving does not guarantee the outcome of any campaign or the use of donated funds
• Donations are generally non-refundable. Refunds may be considered at our sole discretion in cases of documented fraud or campaign cancellation
• Every Giving is not responsible for how fundraisers use the money they raise
• You have verified the campaign to your satisfaction before donating

Donors are encouraged to review a fundraiser's Verified badge before donating. While verification confirms identity, it does not constitute an endorsement of the campaign or a guarantee of how funds will be used.`,
  },
  {
    id: 'prohibited',
    title: '9. Prohibited Conduct',
    content: `You agree not to engage in any of the following:

• Creating false, misleading, or duplicate accounts
• Submitting false or stolen identity documents
• Creating campaigns under false pretences or for fraudulent purposes
• Using the Platform to launder money or conduct financial fraud
• Harassing, threatening, or abusing other users
• Attempting to hack, scrape, or reverse-engineer the Platform
• Using automated bots or scripts to interact with the Platform
• Attempting to gain unauthorised access to other users' accounts
• Violating any applicable Ghanaian law or regulation

Violation of any of the above may result in immediate account suspension, reporting to the Ghana Police Service or Economic and Organised Crime Office (EOCO), and civil or criminal legal action.`,
  },
  {
    id: 'intellectual-property',
    title: '10. Intellectual Property',
    content: `All content on the Every Giving Platform — including but not limited to the logo, wordmark, design, code, text, and graphics — is the property of Every Giving and is protected by Ghanaian and international intellectual property laws.

You may not reproduce, distribute, or create derivative works from our content without express written permission.

By uploading content to the Platform (campaign photos, stories, updates), you grant Every Giving a non-exclusive, royalty-free licence to display and share that content for the purpose of promoting your campaign and the Platform. You retain ownership of your content.`,
  },
  {
    id: 'privacy',
    title: '11. Privacy & Data',
    content: `Your use of the Platform is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Platform, you consent to the collection and use of your data as described in our Privacy Policy.

Key points:
• We collect your name, email, phone number, and identity documents for verification
• We do not sell your personal data to third parties
• Your identity documents are processed by our verification partner and are not stored indefinitely on our servers
• Donor names and amounts may be displayed publicly on campaign pages unless you choose to donate anonymously

For questions about your data, contact us at business@everygiving.org.`,
  },
  {
    id: 'disclaimers',
    title: '12. Disclaimers & Limitation of Liability',
    content: `Every Giving is a platform that connects fundraisers with donors. We are not a financial institution, charity, or guarantor of any campaign's success or legitimacy.

To the fullest extent permitted by Ghanaian law:

• Every Giving provides the Platform "as is" without warranties of any kind
• We do not guarantee that the Platform will be uninterrupted, error-free, or secure at all times
• We are not liable for any loss of funds resulting from fraud by other users
• We are not liable for any indirect, incidental, or consequential damages arising from your use of the Platform
• Our total liability to you in any circumstance shall not exceed the amount of fees (if any) you have paid to Every Giving in the 12 months preceding the claim

Nothing in these Terms excludes or limits liability for fraud, gross negligence, or any other liability that cannot be excluded by law.`,
  },
  {
    id: 'termination',
    title: '13. Termination',
    content: `You may close your account at any time by contacting us at business@everygiving.org. Upon closure, your campaign pages will be deactivated and your data handled in accordance with our Privacy Policy.

Every Giving reserves the right to suspend or permanently terminate your account without notice if:

• You violate any provision of these Terms
• We are required to do so by law or a regulatory authority
• We reasonably believe your account poses a risk of fraud or harm to other users

Upon termination, any pending payouts will be processed to your registered mobile money account, minus any amounts subject to dispute or legal hold.`,
  },
  {
    id: 'governing-law',
    title: '14. Governing Law & Disputes',
    content: `These Terms are governed by and construed in accordance with the laws of the Republic of Ghana. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Ghana.

Before initiating legal proceedings, you agree to attempt to resolve any dispute by contacting us at business@everygiving.org. We will make reasonable efforts to resolve disputes amicably within 30 days of receiving written notice.`,
  },
  {
    id: 'contact',
    title: '15. Contact Us',
    content: `If you have questions about these Terms, please contact us:

Email: business@everygiving.org
Website: everygiving.org
Platform: Every Giving — Ghana's Verified Crowdfunding Platform

We aim to respond to all enquiries within 2 business days.`,
  },
]

export default function TermsPage() {
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
              Terms &amp; Conditions
            </h1>
            <p className="text-white/40 text-sm leading-relaxed max-w-xl">
              Please read these terms carefully before using Every Giving. By creating an account or making a donation, you agree to be bound by these terms.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/25">
              <span>Last updated: {LAST_UPDATED}</span>
              <span>·</span>
              <span>Governing law: Republic of Ghana</span>
              <span>·</span>
              <span>Language: English</span>
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

          {/* Intro */}
          <div className="bg-primary-light border border-primary/15 rounded-2xl p-6 mb-12">
            <div className="font-nunito font-black text-navy text-lg mb-2">Plain English Summary</div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Every Giving is a free platform that helps Ghanaians raise money online with identity verification. <strong className="text-navy">We charge 0% platform fees</strong> — every cedi donated goes to the fundraiser. Fundraisers must verify their identity with a Ghana Card. Donors give voluntarily and should review campaigns before donating. We remove fraudulent campaigns and report fraud to authorities. Questions? Email <a href="mailto:business@everygiving.org" className="text-primary font-semibold">business@everygiving.org</a>.
            </p>
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

          {/* Bottom CTA */}
          <div className="mt-16 bg-navy rounded-2xl p-8 text-center">
            <div className="font-nunito font-black text-white text-xl mb-2">Questions about these terms?</div>
            <p className="text-white/40 text-sm mb-6">We're happy to explain anything in plain language.</p>
            <a href="mailto:business@everygiving.org"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black text-sm px-7 py-3 rounded-full transition-all hover:-translate-y-0.5">
              Email us at business@everygiving.org
            </a>
          </div>

          {/* Related links */}
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-primary transition-colors">Privacy Policy</Link>
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
