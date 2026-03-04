'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Heart, Search, User } from 'lucide-react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Heart className="w-6 h-6 text-green-600 fill-current" />
            <span>Every<span className="text-green-600">Giving</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/campaigns" className="text-gray-600 hover:text-green-600">Browse</Link>
            <Link href="/how-it-works" className="text-gray-600 hover:text-green-600">How It Works</Link>
            <Link href="/success-stories" className="text-gray-600 hover:text-green-600">Stories</Link>
            <Link href="/about" className="text-gray-600 hover:text-green-600">About</Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/search" className="text-gray-600 hover:text-green-600">
              <Search className="w-5 h-5" />
            </Link>
            <Link
              href="/start-fundraiser"
              className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-700 transition"
            >
              Start Fundraiser
            </Link>
            <Link href="/signin" className="text-gray-600 hover:text-green-600">
              <User className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-600"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-3">
              <Link href="/campaigns" className="text-gray-600 py-2">Browse</Link>
              <Link href="/how-it-works" className="text-gray-600 py-2">How It Works</Link>
              <Link href="/success-stories" className="text-gray-600 py-2">Stories</Link>
              <Link href="/about" className="text-gray-600 py-2">About</Link>
              <Link
                href="/start-fundraiser"
                className="bg-green-600 text-white px-4 py-2 rounded-full text-center"
              >
                Start Fundraiser
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
