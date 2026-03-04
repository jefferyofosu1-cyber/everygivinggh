import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <nav className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/" className="text-2xl font-bold text-green-600">
            Every<span className="text-gray-900">Giving</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About Every Giving
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ghana's most trusted crowdfunding platform, built to help people raise money for what matters most.
          </p>
        </div>

        {/* Rest of your about content */}
        <div className="mt-16 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-600">
              To make fundraising in Ghana transparent, trustworthy, and accessible to everyone.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-gray-600">
              Started in 2024, Every Giving has helped over 1,200 Ghanaians raise money for medical emergencies, education, and community projects.
            </p>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2024 Every Giving. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
