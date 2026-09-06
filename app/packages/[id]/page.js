'use client'
import { useEffect, useState, use } from 'react'
import Navbar from '@/components/revamp/Navbar'
import Footer from '@/components/revamp/Footer'
import HomestayDetail from '@/components/HomestayDetail'
import { usePhone, useWhatsapp } from '@/hooks/useSettings'
import { Phone, MessageCircle, Clock, MapPin, Check, X, ChevronDown, ChevronUp, ArrowLeft, Send, Info, Users, Baby, BedDouble } from 'lucide-react'
import Link from 'next/link'

function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN')
}

function fmtRange(dr) {
  if (typeof dr === 'string') return dr
  const { start, end } = dr || {}
  if (!start && !end) return ''
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const f = d => { const dt = new Date(d + 'T00:00:00'); return `${dt.getDate()} ${M[dt.getMonth()]}, ${dt.getFullYear()}` }
  const s = start ? f(start) : '', e = end ? f(end) : ''
  return s && e ? `${s} – ${e}` : s || e
}

export default function PackagePage({ params }) {
  const { id } = use(params)
  const [pkg, setPkg] = useState(null)
  const [openDay, setOpenDay] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const phone = usePhone()
  const whatsapp = useWhatsapp()

  const [enquiry, setEnquiry] = useState({ name: '', phone: '', email: '', message: '' })
  const [enquiryStatus, setEnquiryStatus] = useState(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/packages/' + encodeURIComponent(id))
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (!cancelled) setPkg(data && !data.error ? data : null) })
      .catch(() => { if (!cancelled) setPkg(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  const submitEnquiry = async (e) => {
    e.preventDefault()
    if (!enquiry.name.trim() || !enquiry.phone.trim()) return
    setEnquiryStatus('sending')
    const msgWithId = enquiry.message.trim()
      ? `${enquiry.message.trim()}\n\nPackage ID: ${pkg.id}`
      : `Package ID: ${pkg.id}`
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: pkg.id,
          package_title: pkg.title,
          type: 'package',
          destination: pkg.destination,
          ...enquiry,
          message: msgWithId,
        }),
      })
      if (res.ok) {
        setEnquiryStatus('sent')
        setEnquiry({ name: '', phone: '', email: '', message: '' })
      } else {
        setEnquiryStatus('error')
      }
    } catch {
      setEnquiryStatus('error')
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-[#16294D] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400">Loading package...</p>
      </div>
    </div>
  )

  if (!pkg) return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 font-body">
      <div className="text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Package not found</h2>
        <Link href="/" className="text-[#16294D] font-semibold underline hover:text-[#0E1B33]">← Back to home</Link>
      </div>
    </main>
  )

  if (pkg.category === 'homestay' || pkg.category === 'houseboat') return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HomestayDetail pkg={pkg} phone={phone} whatsapp={whatsapp} isMobile={isMobile} />
      <Footer />
    </main>
  )

  const waMsg = `Hi! I want to book ${pkg.title} (${pkg.id}) — ${!isNaN(pkg.duration) && pkg.duration !== '' ? pkg.duration + ' Days' : pkg.duration} — ${fmt(pkg.salePrice)}/person`

  const occParts = [
    Number(pkg.rooms) > 0 && `${pkg.rooms} room${Number(pkg.rooms) !== 1 ? 's' : ''}`,
    Number(pkg.adults) > 0 && `${pkg.adults} adult${Number(pkg.adults) !== 1 ? 's' : ''}`,
    Number(pkg.children) > 0 && `${pkg.children} child${Number(pkg.children) !== 1 ? 'ren' : ''}`,
  ].filter(Boolean)
  const occSummary = occParts.join(', ')
  const hasBreakdown = Number(pkg.salePrice) > 0 && (Number(pkg.adults) > 0 || Number(pkg.children) > 0 || Number(pkg.childPrice) > 0)
  const childAgeLabel = (pkg.childAgeMin && pkg.childAgeMax)
    ? `${pkg.childAgeMin}–${pkg.childAgeMax} yrs`
    : pkg.childAgeMin ? `${pkg.childAgeMin}+ yrs`
    : pkg.childAgeMax ? `up to ${pkg.childAgeMax} yrs` : ''
  const waChanges = `Hi! I'd like to request changes for ${pkg.title} (${pkg.id})${occSummary ? ` — ${occSummary}` : ''}. Current rate: ₹${Number(pkg.salePrice).toLocaleString('en-IN')}/adult${Number(pkg.childPrice) > 0 ? `, ₹${Number(pkg.childPrice).toLocaleString('en-IN')}/child` : ''}.`

  return (
    <main className="min-h-screen bg-white font-body">
      <Navbar />

      {/* Hero */}
      <div className="relative w-full h-[45vh] lg:h-[60vh] min-h-[320px] overflow-hidden mt-[72px] lg:mt-0">
        <img
          src={pkg.heroImage || pkg.image}
          alt={pkg.title}
          className="w-full h-full object-cover brightness-[0.45]"
          style={{ objectPosition: (pkg.heroImage ? pkg.heroImagePos : pkg.imagePos) || 'center' }}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1400&q=85' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-10 lg:pb-16">
            <Link href="/#packages" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-6 transition-colors font-medium">
              <ArrowLeft size={16} /> Back to packages
            </Link>
            <div className="flex flex-wrap gap-2.5 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm" style={{ backgroundColor: pkg.badgeColor || '#16294D' }}>
                <MapPin size={12} /> {pkg.destination}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold shadow-sm">
                <Clock size={12} /> {!isNaN(pkg.duration) && pkg.duration !== '' ? pkg.duration + ' Days' : pkg.duration}
              </span>
            </div>
            <h1 className="font-heading font-bold text-3xl md:text-5xl lg:text-6xl text-white mb-3 leading-tight drop-shadow-md">
              {pkg.title}
            </h1>
            <p className="text-white/90 text-sm md:text-lg lg:max-w-3xl drop-shadow-sm font-medium">{pkg.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* Left column */}
          <div className="lg:col-span-8 space-y-12">

            {/* Overview */}
            <section>
              <h2 className="font-heading font-bold text-2xl lg:text-3xl text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-600 leading-relaxed text-base lg:text-lg">{pkg.overview}</p>
            </section>

            {/* Highlights */}
            {pkg.highlights?.length > 0 && (
              <section>
                <h2 className="font-heading font-bold text-2xl lg:text-3xl text-gray-900 mb-6">Highlights</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pkg.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <span className="w-6 h-6 rounded-full bg-[#EEF2F8] flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="text-[#16294D] stroke-[3]" />
                      </span>
                      <span className="leading-relaxed font-medium">{h}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Note */}
            {pkg.note?.trim() && (
              <section>
                <div className="bg-[#FBF6E7] border border-[#EBD79A] rounded-2xl p-4 flex gap-3 items-start">
                  <Info size={20} className="text-[#C9A227] shrink-0 mt-0.5" />
                  <p className="text-[#6B5514] text-sm leading-relaxed whitespace-pre-wrap m-0">
                    <strong className="font-bold">Note: </strong>{pkg.note}
                  </p>
                </div>
              </section>
            )}

            {/* Available Dates */}
            {pkg.category === 'group' && pkg.availableDates?.length > 0 && (() => {
              const allDates = pkg.availableDates.flatMap(g => (g.dates || []))
              const validDates = allDates.filter(dr => fmtRange(dr))
              if (!validDates.length) return null

              const monthMap = {}
              const monthOrder = []
              for (const dr of validDates) {
                const d = typeof dr === 'object' ? dr : { start: '', end: dr || '' }
                const monthKey = d.start
                  ? new Date(d.start + 'T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                  : 'Upcoming'
                if (!monthMap[monthKey]) { monthMap[monthKey] = []; monthOrder.push(monthKey) }
                monthMap[monthKey].push(dr)
              }

              return (
                <section>
                  <h2 className="font-heading font-bold text-2xl lg:text-3xl text-gray-900 mb-6">Available Departures</h2>
                  <div className="border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                    {monthOrder.map((month, mi) => (
                      <div key={month} className={mi < monthOrder.length - 1 ? 'border-b border-gray-200' : ''}>
                        <div className="flex items-center gap-2 px-5 py-3.5 bg-gray-50 border-b border-gray-200">
                          <span className="text-lg">📅</span>
                          <span className="font-bold text-sm text-gray-900 uppercase tracking-wider">{month}</span>
                        </div>
                        {monthMap[month].map((dr, di) => (
                          <div key={di} className={`flex items-center justify-between px-5 py-4 gap-4 ${di % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} ${di < monthMap[month].length - 1 ? 'border-b border-gray-100' : ''}`}>
                            <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
                              <span className="text-[15px] text-gray-800 font-medium">{fmtRange(dr)}</span>
                            </div>
                            <a
                              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi! I want to reserve the following package:\n\nPackage: ${pkg.title}\nPackage ID: ${pkg.id}\nDate: ${fmtRange(dr)}`)}`}
                              target="_blank" rel="noopener noreferrer"
                              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#16294D] to-[#2F5490] text-white font-semibold text-xs shadow-md hover:shadow-lg transition-shadow shrink-0"
                            >
                              Reserve
                            </a>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </section>
              )
            })()}

            {/* Itinerary */}
            {pkg.itinerary?.length > 0 && (
              <section>
                <h2 className="font-heading font-bold text-2xl lg:text-3xl text-gray-900 mb-6">
                  Day-wise Itinerary
                </h2>
                <div className="space-y-4">
                  {pkg.itinerary.map((day, i) => {
                    const acts = (day.activities || []).map(a => typeof a === 'string' ? { time: '', emoji: '', title: a, details: [], tags: [] } : a)
                    const isOpen = openDay === i;
                    
                    return (
                      <div key={i} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-[#16294D]/30 shadow-md bg-white' : 'border-gray-200 bg-white shadow-sm hover:border-gray-300'}`}>
                        <button
                          onClick={() => setOpenDay(isOpen ? -1 : i)}
                          className={`w-full flex items-center justify-between p-5 text-left transition-colors cursor-pointer ${isOpen ? 'bg-[#EEF2F8]/30' : ''}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 transition-colors ${isOpen ? 'bg-[#16294D]' : 'bg-gray-800'}`}>
                              {day.day}
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Day {day.day}</div>
                              <div className="text-base font-bold text-gray-900">{day.title}</div>
                            </div>
                          </div>
                          {isOpen ? <ChevronUp size={20} className="text-gray-400 shrink-0" /> : <ChevronDown size={20} className="text-gray-400 shrink-0" />}
                        </button>
                        
                        {isOpen && (
                          <div className="px-5 pb-6 pt-2 border-t border-gray-100">
                            {day.image && (
                              <img src={day.image} alt={day.title} onError={e => e.target.style.display = 'none'}
                                className="w-full h-48 md:h-72 object-cover rounded-xl mt-4 mb-5" 
                                style={{ objectPosition: day.imagePos || 'center' }}
                              />
                            )}
                            {day.description && (
                              <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">{day.description}</p>
                            )}
                            
                            {/* Timeline */}
                            {acts.length > 0 && (
                              <div className="relative pl-0 md:pl-2">
                                {/* Vertical line */}
                                <div className="absolute left-[39px] top-2 bottom-4 w-[2px] bg-gray-100 -z-10" />
                                
                                {acts.map((act, ai) => (
                                  <div key={ai} className="flex gap-4 md:gap-6 mb-6 relative">
                                    {/* Time bubble */}
                                    <div className="shrink-0 w-[80px] flex flex-col items-center gap-1.5 z-10 pt-1">
                                      {act.time ? (
                                        <div className="bg-gray-800 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-md font-mono tracking-wider">
                                          {act.time}
                                        </div>
                                      ) : (
                                        <div className="w-3 h-3 rounded-full bg-[#16294D] border-2 border-white shadow-[0_0_0_2px_rgba(22,41,77,0.2)] mt-1.5" />
                                      )}
                                    </div>
                                    
                                    {/* Activity card */}
                                    <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                      <div className="flex items-start gap-2 mb-2">
                                        {act.emoji && <span className="text-lg leading-tight shrink-0">{act.emoji}</span>}
                                        <span className="font-bold text-gray-900 text-sm leading-snug">{act.title}</span>
                                      </div>
                                      
                                      {(act.details || []).filter(Boolean).length > 0 && (
                                        <ul className="space-y-1 mb-3">
                                          {act.details.filter(Boolean).map((det, ki) => (
                                            <li key={ki} className="flex items-start gap-2 text-xs md:text-sm text-gray-600">
                                              <Check size={14} className="text-green-500 shrink-0 mt-0.5" strokeWidth={3} />
                                              <span className="leading-relaxed">{det}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                      
                                      {(act.tags || []).length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                          {act.tags.map((tag, ti) => (
                                            <span key={ti} className="px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold bg-blue-50 text-blue-600">
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                
                                {/* Overnight stay */}
                                {day.hotel && (
                                  <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200 mt-2 ml-[96px] md:ml-[104px]">
                                    <span className="text-xl">🛏</span>
                                    <span className="text-sm text-gray-600 font-medium">Overnight stay at <span className="text-gray-900 font-bold">{day.hotel}</span></span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Inclusions / Exclusions */}
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {[
                  { label: 'Inclusions', items: pkg.inclusions, icon: Check, color: 'text-green-600', bg: 'bg-green-100' },
                  { label: 'Exclusions', items: pkg.exclusions, icon: X,     color: 'text-[#1F3B66]', bg: 'bg-[#DDE5F0]' },
                ].map(({ label, items, icon: Icon, color, bg }) => (
                  <div key={label} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                        <Icon size={16} className={color} strokeWidth={3} />
                      </span>
                      {label}
                    </h3>
                    <ul className="space-y-2.5">
                      {items?.map((item, i) => (
                        <li key={i} className="flex gap-3 text-sm text-gray-600 font-medium">
                          <Icon size={16} className={`${color} shrink-0 mt-0.5`} />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Enquiry Form */}
            <section className="bg-white rounded-[32px] p-6 lg:p-10 border border-gray-100 shadow-xl shadow-gray-200/40">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-[#EEF2F8] flex items-center justify-center shrink-0">
                  <Send size={24} className="text-[#16294D]" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-2xl text-gray-900 mb-1">Send an Enquiry</h2>
                  <p className="text-sm text-gray-500 font-medium">We'll get back to you within a few hours</p>
                </div>
              </div>

              {enquiryStatus === 'sent' ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="font-bold text-xl text-green-800 mb-2">Enquiry sent successfully!</h3>
                  <p className="text-green-600 mb-6 font-medium">Our team will contact you shortly.</p>
                  <button 
                    onClick={() => setEnquiryStatus(null)}
                    className="px-6 py-2.5 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors cursor-pointer"
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={submitEnquiry} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Name *</label>
                      <input
                        required
                        value={enquiry.name}
                        onChange={e => setEnquiry(q => ({ ...q, name: e.target.value }))}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-medium rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#16294D]/20 focus:border-[#16294D] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number *</label>
                      <input
                        required
                        type="tel"
                        value={enquiry.phone}
                        onChange={e => setEnquiry(q => ({ ...q, phone: e.target.value }))}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-medium rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#16294D]/20 focus:border-[#16294D] transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email (optional)</label>
                    <input
                      type="email"
                      value={enquiry.email}
                      onChange={e => setEnquiry(q => ({ ...q, email: e.target.value }))}
                      placeholder="e.g. rahul@email.com"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-medium rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#16294D]/20 focus:border-[#16294D] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message (optional)</label>
                    <textarea
                      rows={4}
                      value={enquiry.message}
                      onChange={e => setEnquiry(q => ({ ...q, message: e.target.value }))}
                      placeholder="Any specific dates, group size, or questions?"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-medium rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#16294D]/20 focus:border-[#16294D] transition-all resize-none"
                    />
                  </div>
                  
                  {enquiryStatus === 'error' && (
                    <p className="text-[#2F5490] text-sm font-medium">Something went wrong. Please try again.</p>
                  )}
                  
                  <button
                    type="submit"
                    disabled={enquiryStatus === 'sending'}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                      enquiryStatus === 'sending' 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none' 
                        : 'bg-[#16294D] hover:bg-[#0E1B33] text-white hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
                    }`}
                  >
                    {enquiryStatus === 'sending' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" /> 
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} /> Send Enquiry
                      </>
                    )}
                  </button>
                </form>
              )}
            </section>
          </div>

          {/* Right: Booking card (sticky, hidden on mobile) */}
          {!isMobile && (
            <div className="lg:col-span-4">
              <div className="sticky top-28 bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                <div className="bg-gradient-to-br from-[#16294D] to-[#2F5490] p-8">
                  <div className="flex items-center gap-2 mb-2">
                    {pkg.originalPrice && pkg.originalPrice > pkg.salePrice && (
                      <>
                        <span className="text-white/60 text-sm line-through font-medium">{fmt(pkg.originalPrice)}</span>
                        <span className="bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide">
                          SAVE {fmt(pkg.originalPrice - pkg.salePrice)}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-4xl lg:text-5xl font-heading font-bold text-white mb-1">
                    {fmt(pkg.salePrice)}
                  </div>
                  <div className="text-white/80 text-sm font-medium mb-4">
                    {Number(pkg.childPrice) > 0 ? 'Per Adult' : pkg.priceNote}
                  </div>
                  <div className="flex items-start gap-2 bg-white/10 rounded-xl p-3">
                    <Info size={16} className="text-white shrink-0 mt-0.5" />
                    <span className="text-white/90 text-xs leading-relaxed font-medium">Rate may change based on your customization.</span>
                  </div>
                </div>

                <div className="p-8">
                  {(Number(pkg.rooms) > 0 || Number(pkg.adults) > 0 || Number(pkg.children) > 0) && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {[
                        { Icon: BedDouble, n: pkg.rooms, s: 'Room', p: 'Rooms' },
                        { Icon: Users, n: pkg.adults, s: 'Adult', p: 'Adults' },
                        { Icon: Baby, n: pkg.children, s: 'Child', p: 'Children' },
                      ].filter(({ n }) => Number(n) > 0).map(({ Icon, n, s, p }) => (
                        <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EEF2F8] text-[#16294D] text-xs font-bold">
                          <Icon size={14} /> {n} {Number(n) !== 1 ? p : s}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="space-y-3 mb-6">
                    {[
                      { l: 'Duration', v: pkg.duration },
                      { l: 'Destination', v: pkg.destination },
                      { l: 'Stay', v: pkg.hotels },
                    ].filter(({ v }) => v).map(({ l, v }) => (
                      <div key={l} className="flex justify-between items-start text-sm">
                        <span className="text-gray-500 font-medium">{l}</span>
                        <span className="font-bold text-gray-900 text-right max-w-[60%]">{v}</span>
                      </div>
                    ))}
                  </div>

                  {hasBreakdown && (
                    <>
                      <hr className="border-gray-100 my-5" />
                      <div className="font-bold text-gray-900 text-sm mb-3">Price Breakdown</div>
                      <div className="space-y-2 mb-5">
                        {Number(pkg.salePrice) > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium">Price per adult</span>
                            <span className="font-bold text-gray-900">{fmt(pkg.salePrice)}</span>
                          </div>
                        )}
                        {Number(pkg.childPrice) > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium">Price per child{childAgeLabel ? ` (${childAgeLabel})` : ''}</span>
                            <span className="font-bold text-gray-900">{fmt(pkg.childPrice)}</span>
                          </div>
                        )}
                      </div>
                      <a
                        href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(waChanges)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-green-50 hover:bg-green-100 text-green-700 font-bold text-sm transition-colors mb-2 cursor-pointer"
                      >
                        <MessageCircle size={16} /> Request Changes
                      </a>
                    </>
                  )}

                  <hr className="border-gray-100 my-6" />

                  <div className="space-y-3">
                    <a
                      href={`tel:+${phone}`}
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-gradient-to-r from-[#16294D] to-[#2F5490] text-white font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
                    >
                      <Phone size={18} /> Call to Book
                    </a>
                    <a
                      href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(waMsg)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
                    >
                      <MessageCircle size={18} /> WhatsApp Enquiry
                    </a>
                  </div>
                  
                  <p className="text-center text-xs font-medium text-gray-400 mt-5">
                    No booking fees · Instant confirmation
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Mobile sticky bottom bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-start gap-2 px-4 py-2 bg-[#FBF6E7] border-b border-[#F5E9C6]">
            <Info size={12} className="text-[#B08D1F] shrink-0 mt-0.5" />
            <span className="text-[10px] text-[#8A6E1C] leading-tight font-medium">
              {Number(pkg.childPrice) > 0 ? `${fmt(pkg.childPrice)}/child · ` : ''}Rate may change based on your customization.
            </span>
          </div>
          <div className="p-3.5 px-4 flex items-center gap-3">
            <div className="flex-1">
              {pkg.originalPrice && pkg.originalPrice > pkg.salePrice && (
                <div className="text-[10px] text-gray-400 line-through font-medium">{fmt(pkg.originalPrice)}</div>
              )}
              <div className="text-xl font-heading font-bold text-[#16294D] leading-none">
                {fmt(pkg.salePrice)}
                <span className="text-[10px] text-gray-500 font-medium ml-1">/{Number(pkg.childPrice) > 0 ? 'adult' : 'person'}</span>
              </div>
            </div>
            <a
              href={`tel:+${phone}`}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#16294D] to-[#2F5490] text-white font-bold text-sm flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Phone size={14} /> Call
            </a>
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(waMsg)}`}
              target="_blank" rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-[#25D366] text-white font-bold text-sm flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
          </div>
        </div>
      )}
    </main>
  )
}
