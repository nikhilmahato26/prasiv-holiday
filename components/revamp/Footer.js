import { Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-navy text-white pt-20 pb-10 font-body border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand & About (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center group w-fit">
              <div className="relative w-28 h-28 bg-white p-2 rounded-2xl shadow-md group-hover:opacity-90 transition-opacity">
                <Image
                  src="/logo.png"
                  alt="Prashiv Holiday"
                  fill
                  sizes="112px"
                  className="object-contain p-2"
                />
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Your trusted travel partner for crafting unforgettable journeys. We offer customized domestic holiday packages and hassle-free travel planning services.
            </p>
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-[#C9A227] hover:border-[#C9A227] transition-all text-gray-400 hover:text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-[#C9A227] hover:border-[#C9A227] transition-all text-gray-400 hover:text-white hidden">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z"></path></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-[#C9A227] hover:border-[#C9A227] transition-all text-gray-400 hover:text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
          </div>

          {/* About Us (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-heading font-semibold mb-6 text-white uppercase tracking-wider text-sm">About Us</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><Link href="/#home" className="hover:text-[#C9A227] transition-colors">Home</Link></li>
              <li><Link href="/#services" className="hover:text-[#C9A227] transition-colors">About Us</Link></li>
              <li><Link href="/#packages" className="hover:text-[#C9A227] transition-colors">Tours</Link></li>
              <li><Link href="/#contact" className="hover:text-[#C9A227] transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Top Destinations (3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-lg font-heading font-semibold mb-6 text-white uppercase tracking-wider text-sm">Top Destinations</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><Link href="/#destinations" className="hover:text-[#C9A227] transition-colors">Thailand</Link></li>
              <li><Link href="/#destinations" className="hover:text-[#C9A227] transition-colors">Singapore</Link></li>
              <li><Link href="/#destinations" className="hover:text-[#C9A227] transition-colors">Dubai</Link></li>
              <li><Link href="/#destinations" className="hover:text-[#C9A227] transition-colors">Bali, Indonesia</Link></li>
              <li><Link href="/#destinations" className="hover:text-[#C9A227] transition-colors">Kerala, India</Link></li>
            </ul>
          </div>

          {/* Contact Info (3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-lg font-heading font-semibold mb-6 text-white uppercase tracking-wider text-sm">Contact Us</h3>
            <ul className="space-y-5 text-gray-400 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#C9A227] shrink-0" />
                <a href="tel:+917796950505" className="hover:text-[#C9A227] transition-colors">+91 77969 50505</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#C9A227] shrink-0 mt-0.5" />
                <a href="mailto:info@prashivholiday.com" className="hover:text-[#C9A227] transition-colors">info@prashivholiday.com</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Prashiv Holiday. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
