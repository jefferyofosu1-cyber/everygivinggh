// components/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Heart, Search, User, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/campaigns', label: 'Browse' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/success-stories', label: 'Stories' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200' 
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xl md:text-2xl font-bold text-gray-900"
          >
            <Heart className="w-6 h-6 md:w-8 md:h-8 text-green-600 fill-current" />
            <span>Every<span className="text-green-600">Giving</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition hover:text-green-600 ${
                  pathname === link.href 
                    ? 'text-green-600 border-b-2 border-green-600 pb-1' 
                    : 'text-gray-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/search"
              className="p-2 text-gray-600 hover:text-green-600 transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>
            
            <Link
              href="/start-fundraiser"
              className="bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-green-700 transition inline-flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Start Fundraiser
            </Link>

            <Link
              href="/signin"
              className="p-2 text-gray-600 hover:text-green-600 transition"
              aria-label="Sign in"
            >
              <User className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-green-600 transition"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-fade-in">
          <div className="container-custom py-4">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 rounded-lg text-base font-medium transition ${
                    pathname === link.href
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="border-t border-gray-200 my-2 pt-2">
                <Link
                  href="/search"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Search className="w-5 h-5" />
                  <span>Search campaigns</span>
                </Link>
                
                <Link
                  href="/start-fundraiser"
                  className="flex items-center gap-3 px-4 py-3 text-green-600 font-semibold hover:bg-green-50 rounded-lg"
                >
                  <Heart className="w-5 h-5" />
                  <span>Start Fundraiser</span>
                </Link>
                
                <Link
                  href="/signin"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <User className="w-5 h-5" />
                  <span>Sign In</span>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
