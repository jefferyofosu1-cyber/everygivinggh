import { PortableText } from '@portabletext/react'

type FAQ = {
  _id: string
  question: string
  answer: any
}

type FAQSectionProps = {
  faqs: FAQ[]
}

export function FAQSection({ faqs }: FAQSectionProps) {
  if (!faqs.length) return null

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="font-nunito font-black text-navy text-3xl mb-6">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq._id}
              className="group bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-semibold text-sm text-navy">
                  {faq.question}
                </span>
                <span className="ml-4 text-gray-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="mt-3 text-sm text-gray-600 leading-relaxed">
                <PortableText value={faq.answer} />
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

