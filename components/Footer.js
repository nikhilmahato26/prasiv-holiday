'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Phone, Mail, MessageCircle, MapPin } from 'lucide-react'
import { usePhone, useWhatsapp, useEmail, useEmail2, useFacebook, useInstagram } from '@/hooks/useSettings'

function IgIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
}
function FbIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
}

import { ALL_DESTINATIONS } from '@/lib/destinations-data'

export default function Footer() {
  const phone = usePhone()
  const whatsapp = useWhatsapp()
  const email = useEmail()
  const email2 = useEmail2()
  const facebook = useFacebook()
  const instagram = useInstagram()
  const [footerDests, setFooterDests] = useState([])

  useEffect(() => {
    setFooterDests(ALL_DESTINATIONS.filter(d => d.featured !== false))
  }, [])

  return (
    <footer style={{ background: '#FAF7EC' }} className="text-gray-800">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-28 h-28 shrink-0 relative">
                <Image src="/logo.png" alt="Prashiv Holiday" fill className="object-contain object-left" />
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color:'#4b5563' }}>15+ years of trusted expertise in customized Indian holidays and travel planning.</p>
            <div className="flex gap-3">
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full flex items-center justify-center text-gray-700 transition hover:bg-[#F5E9C6]" style={{ background:'rgba(0,0,0,0.05)' }}><IgIcon/></a>
              <a href={facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full flex items-center justify-center text-gray-700 transition hover:bg-[#F5E9C6]" style={{ background:'rgba(0,0,0,0.05)' }}><FbIcon/></a>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full flex items-center justify-center text-gray-700 transition hover:bg-[#F5E9C6]" style={{ background:'rgba(0,0,0,0.05)' }}><MessageCircle size={22}/></a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm tracking-wider uppercase mb-4" style={{ color:'#111827' }}>Destinations</h4>
            <ul className="space-y-2 text-sm" style={{ color:'#4b5563' }}>
              {footerDests.map(d => (
                <li key={d.id}><Link href="/#packages" className="flex items-center gap-1.5 hover:text-[#C9A227] transition-colors"><MapPin size={11}/>{d.emoji ? `${d.emoji} ` : ''}{d.name}</Link></li>
              ))}
              {footerDests.length === 0 && (
                <>
                  <li><Link href="/#packages" className="flex items-center gap-1.5 hover:text-[#C9A227] transition-colors"><MapPin size={11}/>Munnar</Link></li>
                  <li><Link href="/#packages" className="flex items-center gap-1.5 hover:text-[#C9A227] transition-colors"><MapPin size={11}/>Alleppey</Link></li>
                  <li><Link href="/#packages" className="flex items-center gap-1.5 hover:text-[#C9A227] transition-colors"><MapPin size={11}/>Wayanad</Link></li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm tracking-wider uppercase mb-4" style={{ color:'#111827' }}>Quick Links</h4>
            <ul className="space-y-2 text-sm" style={{ color:'#4b5563' }}>
              {[['Home','/'],['Packages','/#packages'],['About','/#about'],['Contact','/#contact']].map(([l,h]) => (
                <li key={l}><Link href={h} className="hover:text-[#C9A227] transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm tracking-wider uppercase mb-4" style={{ color:'#111827' }}>Contact</h4>
            <ul className="space-y-3 text-sm" style={{ color:'#4b5563' }}>
              <li><a href={`tel:+${phone}`} className="flex items-center gap-2 hover:text-[#C9A227] transition-colors"><Phone size={14}/> +{phone}</a></li>
              {email && <li><a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-[#C9A227] transition-colors"><Mail size={14}/> {email.toLowerCase()}</a></li>}
              {email2 && <li><a href={`mailto:${email2}`} className="flex items-center gap-2 hover:text-[#C9A227] transition-colors"><Mail size={14}/> {email2.toLowerCase()}</a></li>}
              <li><a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-green-400 transition-colors"><MessageCircle size={14}/> WhatsApp Us</a></li>
              <li><a href="https://maps.app.goo.gl/cQp5bUePhXKk3tin6?g_st=awb" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-[#C9A227] transition-colors"><MapPin size={14} className="mt-0.5 shrink-0"/> <span className="leading-tight">239, Vivek vihar, Ranipur mor,<br/>Haridwar-249401</span></a></li>
              <li><a href="https://maps.app.goo.gl/bCAXe6AwZZK3dsUK8?g_st=awb" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-[#C9A227] transition-colors"><MapPin size={12} className="mt-0.5 shrink-0"/> <span className="leading-tight text-xs mt-0.5 opacity-80">Flat number 03, Aravalli apartments,<br/>Iris global mahipalpur bypass, Delhi</span></a></li>
            </ul>
          </div>
        </div>

        <div className="h-px mb-6" style={{ background:'rgba(0,0,0,0.1)' }} />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color:'#6b7280' }}>
          <p>© {new Date().getFullYear()} Triphoga. All rights reserved.</p>
          <p>Made with ❤️ for wanderers</p>
        </div>
      </div>
    </footer>
  )
}
