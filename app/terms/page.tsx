import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const LAST_UPDATED = 'March 2026'

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing or using the EveryGiving platform at everygiving.org ("Platform"), you agree to be bound by these Terms and Conditions. If you do not agree, you may not use the Platform.

These Terms form a legally binding agreement between you and EveryGiving, a crowdfunding platform operated in Ghana. By creating an account, submitting a campaign, or making a donation, you confirm you have read and accepted these Terms.

We may update these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the updated Terms.`,
  },
  {
    id: 'eligibility',
    title: '2. Eligibility',
    content: `To use EveryGiving you must:
* Be at least 18 years old
* Be a resident of Ghana or have a valid Ghanaian bank or mobile money account
* Provide accurate and truthful information during registration and campaign creation
* Not be prohibited from using the Platform under any applicable law

By using the Platform, you represent and warrant that you meet all of these requirements.`,
  },
  {
    id: 'accounts',
    title: '3. User Accounts',
    content: `You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately at business@everygiving.org if you believe your account has been compromised.

You may not share your account with others or use another person's account without their explicit permission. EveryGiving is not liable for any loss resulting from unauthorised use of your account.`,
  },
  {
    id: 'campaigns',
    title: '4. Campaign Creation & Identity Verification',
    content: `All fundraisers must submit a valid identity document (Ghana Card, Passport, Driver's Licence, Voter's ID, NHIS Card, or other accepted government-issued ID) before a campaign can be approved.

EveryGiving's team reviews all identity documents manually before approving any campaign. Approval is typically completed within 24 hours. We reserve the right to reject any campaign at our sole discretion.

Verification tiers (Basic, Standard, Premium, Gold, Diamond) determine the maximum fundraising goal permitted for each campaign. Verification fees are one-time, non-refundable, and may be paid upfront or deferred and deducted from the first donations received.

You agree that your campaign:
* Is truthful, accurate, and not misleading in any way
* Does not violate any Ghanaian law or regulation
* Does not involve fraud, deception, or misrepresentation
* Will use funds solely for the stated purpose
* Will provide updates to donors on the use of funds`,
  },
  {
    id: 'prohibited',
    title: '5. Prohibited Content & Uses',
    content: `You may not use EveryGiving to fundraise for:
* Illegal activities of any kind
* Political campaigns or partisan causes
* Hate speech, discrimination, or content targeting individuals
* Weapons, drugs, or controlled substances
* Pyramid schemes or multi-level marketing
* Any activity that violates Ghanaian law

EveryGiving reserves the right to remove any campaign and suspend any account that violates these prohibitions without prior notice.`,
  },
  {
    id: 'fees',
    title: '6. Fees & Transaction Charges',
    content: `EveryGiving charges a transaction fee of 2% + GH₵0.25 per donation received. This fee is automatically deducted from each donation before the net amount is credited to the fundraiser.

There is no platform fee. Creating a campaign is always free.

Verification fees (GH₵50 for Standard, GH₵100 for Premium, GH₵200 for Gold, GH₵500 for Diamond) are one-time charges per campaign. Basic verification is free. All verification fees are non-refundable.

If you choose to defer your verification fee, it will be automatically deducted from your first donations received once your campaign is live.`,
  },
  {
    id: 'payouts',
    title: '7. Payouts & Milestone Releases',
    content: `Donations received are held securely and released to fundraisers according to milestones set at the time of campaign creation. Fundraisers set their own milestones before submitting their campaign.

Payouts are made via mobile money (MTN MoMo, Vodafone Cash, AirtelTigo), bank transfer, or card. There is no fee to withdraw funds.

EveryGiving is not responsible for delays caused by mobile money providers, banks, or technical issues beyond our control. We will work to resolve any payout issues promptly.

EveryGiving may withhold or reverse payouts if fraud, misrepresentation, or a violation of these Terms is discovered.`,
  },
  {
    id: 'donors',
    title: '8. Donor Responsibilities',
    content: `Donations are voluntary. By making a donation you acknowledge that:
* You are not purchasing a product or service
* Donations are not guaranteed to reach any specific goal
* EveryGiving does not guarantee the outcome of any campaign
* You have read the campaign description and are satisfied with its contents

Donations are generally non-refundable. In cases of verified fraud, EveryGiving will make reasonable efforts to facilitate refunds where possible.`,
  },
  {
    id: 'liability',
    title: '9. Limitation of Liability',
    content: `EveryGiving is a platform that connects fundraisers and donors. We do not endorse, guarantee, or take responsibility for the accuracy of any campaign content.

To the maximum extent permitted by Ghanaian law, EveryGiving shall not be liable for:
* Any indirect, incidental, or consequential damages
* Loss of donations due to fraud by a third party
* Technical failures or interruptions of service
* Actions or omissions of fundraisers or donors

Our total liability to you in any circumstance shall not exceed the total fees paid by you to EveryGiving in the 12 months preceding the claim.`,
  },
  {
    id: 'privacy',
    title: '10. Privacy',
    content: `Your use of EveryGiving is also governed by our Privacy Policy, available at everygiving.org/privacy. By using the Platform, you consent to the collection and use of your information as described in that policy.

We comply with the Ghana Data Protection Act, 2012 (Act 843).`,
  },
  {
    id: 'termination',
    title: '11. Account Termination',
    content: `EveryGiving reserves the right to suspend or permanently terminate any account at any time, with or without notice, for violations of these Terms or for any other reason we consider appropriate.

You may close your account at any time by contacting us at business@everygiving.org. Closure does not affect any ongoing campaigns or outstanding obligations.`,
  },
  {
    id: 'governing',
    title: '12. Governing Law',
    content: `These Terms are governed by and construed in accordance with the laws of the Republic of Ghana. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Ghana.

If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.`,
  },
  {
    id: 'contact',
    title: '13. Contact Us',
    content: `If you have questions about these Terms, please contact us:

Email: business@everygiving.org
Platform: everygiving.org/contact
Address: Accra, Ghana

We aim to respond to all enquiries within 3 business days.`,
  },
]

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="bg-navy py-16 px-5">
          <div className="max-w-3xl mx-auto">
            <div className="inline-block bg-primary/15 border border-primary/30 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-5">Legal</div>
            <h1 className="font-nunito font-black text-white text-4xl md:text-5xl tracking-tight mb-4" style={{ letterSpacing: -1 }}>
              Terms &amp; Conditions
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
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-10 text-sm text-amber-800">
              <strong>Please read these Terms carefully</strong> before creating a campaign or making a donation on EveryGiving. By using the platform you agree to be bound by these Terms.
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
              <div className="font-nunito font-black text-white text-xl mb-2">Questions about these Terms?</div>
              <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
                We are happy to clarify anything. Contact our team and we will respond within 3 business days.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a href="mailto:business@everygiving.org?subject=Terms Question"
                  className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black text-sm px-7 py-3 rounded-full transition-all hover:-translate-y-0.5">
                  Email us →
                </a>
                <Link href="/contact"
                  className="inline-block border-2 border-white/20 hover:border-primary text-white/70 hover:text-white font-bold text-sm px-7 py-3 rounded-full transition-all">
                  Contact page
                </Link>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10 flex justify-center gap-4 text-xs text-white/30">
                <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
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
