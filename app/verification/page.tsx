import Link from 'next/link';

export default function VerificationPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-green-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            Get Verified
          </h1>
          <p className="text-xl mb-8">
            Build trust with donors. It's free and takes 2 minutes.
          </p>
          <Link 
            href="/verify" 
            className="bg-white text-green-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 inline-block"
          >
            Start Verification
          </Link>
        </div>
      </div>

      {/* Simple Steps */}
      <div className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-green-600 pl-4 py-2">
              <div className="text-2xl font-bold text-green-600">1</div>
              <h3 className="text-xl font-semibold">Sign Up</h3>
              <p className="text-gray-600">Create your free account</p>
            </div>

            <div className="border-l-4 border-green-600 pl-4 py-2">
              <div className="text-2xl font-bold text-green-600">2</div>
              <h3 className="text-xl font-semibold">Upload ID</h3>
              <p className="text-gray-600">Ghana Card, Voter's ID, or Passport</p>
            </div>

            <div className="border-l-4 border-green-600 pl-4 py-2">
              <div className="text-2xl font-bold text-green-600">3</div>
              <h3 className="text-xl font-semibold">Take Selfie</h3>
              <p className="text-gray-600">Hold your ID so we can match you</p>
            </div>

            <div className="border-l-4 border-green-600 pl-4 py-2">
              <div className="text-2xl font-bold text-green-600">4</div>
              <h3 className="text-xl font-semibold">Get Verified</h3>
              <p className="text-gray-600">Approval within 24-48 hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Verify */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Why Verify?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-semibold">Trust Badge</h3>
              <p className="text-sm text-gray-600">Get verified badge on your campaign</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-semibold">Raise More</h3>
              <p className="text-sm text-gray-600">Verified fundraisers raise 3x more</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-semibold">Fast Payouts</h3>
              <p className="text-sm text-gray-600">Get funds within 24-48 hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Accepted IDs */}
      <div className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Accepted IDs</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded">Ghana Card</div>
            <div className="p-4 bg-gray-50 rounded">Voter's ID</div>
            <div className="p-4 bg-gray-50 rounded">Passport</div>
            <div className="p-4 bg-gray-50 rounded">Driver's License</div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Questions?</h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded">
              <p className="font-semibold">Is it free?</p>
              <p className="text-gray-600">Yes, verification is completely free!</p>
            </div>
            <div className="bg-white p-4 rounded">
              <p className="font-semibold">How long does it take?</p>
              <p className="text-gray-600">Usually 24-48 hours</p>
            </div>
            <div className="bg-white p-4 rounded">
              <p className="font-semibold">Is my info safe?</p>
              <p className="text-gray-600">Yes, encrypted and secure</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Verified?</h2>
        <Link 
          href="/verify" 
          className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 inline-block"
        >
          Start Now
        </Link>
      </div>
    </div>
  );
}
