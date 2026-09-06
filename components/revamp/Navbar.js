'use client';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/#home' },
    { name: 'About Us', href: '/#about' },
    { name: 'Tours/Packages', href: '/#packages' },
    { name: 'Flight Booking', href: '/#flight' },
    { name: 'Railway Reservation', href: '/#train' },
    { name: 'Contact Us', href: '/#contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 font-body ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-1.5' : 'bg-white py-1.5 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="relative w-16 h-16 md:w-20 md:h-20 group-hover:opacity-90 transition-transform origin-left">
                <Image
                  src="/logo.png"
                  alt="Prashiv Holiday"
                  fill
                  sizes="(max-width: 768px) 64px, 80px"
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <div className="flex space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[15px] font-medium transition-colors text-gray-800 hover:text-[#16294D]"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="tel:+917796950505" className="flex items-center text-[15px] font-semibold transition-colors text-gray-800 hover:text-[#16294D]">
                +91 77969 50505
              </a>
              <Link
                href="/#contact"
                className="bg-[#C9A227] text-[#0E1B33] px-6 py-2.5 rounded-full text-[15px] font-semibold hover:bg-[#B08D1F] transition-colors"
              >
                Talk to us
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-900"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute w-full bg-white shadow-xl transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-[400px] py-4' : 'max-h-0 py-0'
        }`}
      >
        <div className="px-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="block text-gray-800 font-medium hover:text-[#16294D] text-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
             <a href="tel:+917796950505" className="text-gray-800 font-semibold text-lg">
                +91 77969 50505
             </a>
            <Link
              href="/#contact"
              className="bg-[#C9A227] text-[#0E1B33] px-6 py-3 rounded-full font-semibold hover:bg-[#B08D1F] transition-colors text-center block text-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Talk to us
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
