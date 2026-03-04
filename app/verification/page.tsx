'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, CheckCircle, Camera, Clock, ArrowRight, HelpCircle } from 'lucide-react';

export default function VerificationPage() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      number: 1,
      title: "Create Account",
      description: "Sign up with your email or phone number",
      icon: "📝"
    },
    {
      number: 2,
      title: "Upload Your ID",
      description: "Ghana Card, Voter's ID, or Passport",
      icon: "🪪"
    },
    {
      number: 3,
      title: "Take a Selfie",
      description: "Take a photo holding your ID",
      icon: "🤳"
    },
    {
      number: 4,
      title: "Get Verified",
      description: "Approval within 24-48 hours",
      icon: "✅"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <nav className="bg-white border-b border-gray-200 py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="text-2xl font-bold text-green-600">
            Every<span className="text-gray-900">Giving</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block bg-green-100 rounded-full p-4 mb-6">
            <Shield className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get Verified on Every Giving
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Build trust with donors. It's free and takes just 2 minutes.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">24-48h</div>
            <div className="text-sm text-gray-500">Verification time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">100%</div>
            <div className="text-sm text-gray-500">Free to verify</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">3x</div>
            <div className="text-sm text-gray-500">More donations</div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-12">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`border-2 rounded-xl p-6 transition cursor-pointer ${
                activeStep === step.number
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
              onClick={() => setActiveStep(step.number)}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{step.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-green-100 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-green-600">
                      {step.number}
                    </span>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-gray-600 ml-8">{step.description}</p>
                </div>
                {activeStep === step.number && (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Accepted IDs */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-semibold text-center mb-6">Accepted Identification</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🟢</div>
              <div className="font-medium">Ghana Card</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🗳️</div>
              <div className="font-medium">Voter's ID</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🛂</div>
              <div className="font-medium">Passport</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🚗</div>
              <div className="font-medium">Driver's License</div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            href="/verify"
            className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition inline-flex items-center gap-2 shadow-lg"
          >
            Start Verification <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            🔒 Your information is encrypted and secure
          </p>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 px-4 mt-16">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <p>© 2024 Every Giving. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
