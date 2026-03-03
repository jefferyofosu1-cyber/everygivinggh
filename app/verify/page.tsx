'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Upload, Camera, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function VerifyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    idType: '',
    idNumber: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Show success and redirect
    alert('✓ Verification submitted! Our team will review within 24-48 hours.');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <Link href="/verification" className="inline-flex items-center text-gray-600 hover:text-green-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to verification info
        </Link>

        {/* Progress bar */}
        <div className="bg-white rounded-t-2xl p-8 border-b">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-600" />
              <h1 className="text-2xl font-bold">Get Verified</h1>
            </div>
            <span className="text-sm text-gray-500">Step {step} of 3</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i <= step ? 'bg-green-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-b-2xl p-8 shadow-lg">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="As it appears on your ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">ID Type</label>
                  <select
                    value={formData.idType}
                    onChange={(e) => setFormData({...formData, idType: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select ID type</option>
                    <option value="ghana-card">Ghana Card</option>
                    <option value="voter">Voter's ID</option>
                    <option value="passport">Passport</option>
                    <option value="drivers">Driver's License</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">ID Number</label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your ID number"
                    required
                  />
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition mt-4"
                >
                  Continue to ID Upload
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Upload Your ID</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500 mb-4">PNG, JPG up to 5MB</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="id-upload"
                />
                <button
                  onClick={() => document.getElementById('id-upload')?.click()}
                  className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Select File
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                📸 Take a clear photo of your ID. Make sure all details are visible.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
                >
                  Continue to Selfie
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Take a Selfie</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Take a selfie holding your ID</p>
                <p className="text-sm text-gray-500 mb-4">Make sure your face and ID are clearly visible</p>
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  id="selfie-upload"
                />
                <button
                  onClick={() => document.getElementById('selfie-upload')?.click()}
                  className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Take Photo
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                💡 Good lighting helps! Make sure your face is clearly visible.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Submit for Review
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 text-center mt-6">
            🔒 Your information is encrypted and secure. We'll review within 24-48 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
