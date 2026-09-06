'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X, Phone, MessageCircle } from 'lucide-react'
import { usePhone } from '@/hooks/useSettings'

export default function Navbar({ big = false }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const phone = usePhone()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const navLinks = [
    { label: 'Home',         href: '/' },
    { label: 'About Us',     href: '/#about' },
    { label: 'Tours/Packages', href: '/packages' },
    { label: 'Flight Booking', href: '/#flight' },
    { label: 'Railway Reservation', href: '/#train' },
    { label: 'Contact Us',   href: '/#contact' },
  ]

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,1)',
        backdropFilter: 'blur(12px)',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 md:h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center justify-center group">
            <div className="w-14 h-14 md:w-16 md:h-16 relative shrink-0">
              <Image
                src="/logo.png"
                alt="Prashiv Holiday"
                fill
                sizes="(max-width: 768px) 56px, 64px"
                className="object-contain object-left"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className={`hidden md:flex items-center ${big ? 'gap-9' : 'gap-7'}`}>
            {navLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`${big ? 'text-base md:text-lg' : 'text-sm'} font-medium tracking-wide relative group transition-colors duration-200`}
                style={{ color: '#374151' }}
              >
                {l.label}
                <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300 rounded-full" style={{ background: '#8A6E1C' }} />
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href={`tel:+${phone}`}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border transition-all duration-200"
              style={{ borderColor: '#8A6E1C', color: '#8A6E1C' }}
            >
              <Phone size={14} /> Call Us
            </a>
            <a
              href={`https://wa.me/${phone}?text=Hi! I want to book a trip!`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full text-white transition-all duration-200 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)' }}
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg" style={{ color: '#374151' }}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t" style={{ background: '#fff', borderColor: 'rgba(0,0,0,0.06)' }}>
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2.5 px-3 text-gray-700 font-medium rounded-xl transition-colors">
                {l.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-3">
              <a
                href={`tel:+${phone}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-sm font-semibold border"
                style={{ borderColor: '#8A6E1C', color: '#8A6E1C' }}
              >
                <Phone size={14} /> Call
              </a>
              <a
                href={`https://wa.me/${phone}?text=Hi! I want to book a trip!`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)' }}
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
