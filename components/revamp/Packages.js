'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Phone, MessageCircle, MapPin, Calendar, CheckCircle2, ArrowRight } from 'lucide-react'
import { usePackages } from '@/hooks/usePackages'
import { usePhone, useWhatsapp } from '@/hooks/useSettings'

function fmt(n) {
  if (!n) return ''
  return '₹' + Number(n).toLocaleString('en-IN')
}

export default function Packages() {
  const [region, setRegion] = useState('domestic')
  const [activeCategory, setActiveCategory] = useState('')
  const [destOrder, setDestOrder] = useState([])
  const { packages, loaded } = usePackages()
  const phone = usePhone()
  const whatsapp = useWhatsapp()

  // Category tabs come from the admin — ordered by the admin's Categories list,
  // limited to those that actually have live packages.
  useEffect(() => {
    fetch('/api/destinations')
      .then(r => (r.ok ? r.json() : []))
      .then(rows => setDestOrder(Array.isArray(rows) ? rows.map(d => d.name) : []))
      .catch(() => setDestOrder([]))
  }, [])

  // Packages written before the domestic/international split have no region.
  const regionOf = pkg => pkg.region || 'domestic'
  const domesticCount = packages.filter(p => regionOf(p) === 'domestic').length
  const internationalCount = packages.filter(p => regionOf(p) === 'international').length

  const regionPackages = packages.filter(p => regionOf(p) === region)
  const pkgDestinations = Array.from(new Set(regionPackages.map(p => p.destination).filter(Boolean)))
  const categories = [
    ...destOrder.filter(name => pkgDestinations.includes(name)),
    ...pkgDestinations.filter(name => !destOrder.includes(name)).sort(),
  ]

  // Resolve the tab during render rather than in an effect: before the packages
  // load, and right after a region switch, the stored tab is not in this
  // region's list, so fall back to its first destination.
  const activeCat = categories.includes(activeCategory) ? activeCategory : (categories[0] || '')

  const filteredPackages = regionPackages.filter(pkg => pkg.destination === activeCat)

  const REGIONS = [
    { key: 'domestic', label: 'Domestic', count: domesticCount },
    { key: 'international', label: 'International', count: internationalCount },
  ]

  return (
    <section id="packages" className="py-24 bg-gray-50 font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[#16294D] font-semibold tracking-widest text-xs uppercase mb-3">
            Our Signature Packages
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-gray-900 mb-6">
            Curated Experiences
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-base">
            Handcrafted tours across India and beyond. Choose domestic or international, then pick a destination to see detailed day-wise itineraries.
          </p>
        </div>

        {/* Domestic / International switch */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-white border border-gray-200/80 shadow-sm">
            {REGIONS.map(r => (
              <button
                key={r.key}
                onClick={() => { setRegion(r.key); setActiveCategory('') }}
                aria-pressed={region === r.key}
                className={`px-7 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 cursor-pointer ${
                  region === r.key
                    ? 'bg-[#16294D] text-white shadow-md'
                    : 'text-gray-500 hover:text-[#16294D]'
                }`}
              >
                {r.label}
                {r.count > 0 && (
                  <span className={`ml-2 text-xs font-semibold ${region === r.key ? 'text-[#C9A227]' : 'text-gray-400'}`}>
                    {r.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs Selection */}
        <div className="flex gap-2.5 overflow-x-auto pb-4 mb-12 scrollbar-none snap-x snap-mandatory justify-start lg:justify-center lg:flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`snap-align-start px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer ${
                activeCat === cat
                  ? 'bg-gradient-to-r from-[#16294D] to-[#2F5490] text-white shadow-lg shadow-[#2F5490]/20 transform -translate-y-0.5'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80 shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading Shimmer */}
        {!loaded ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between animate-pulse h-[480px]">
                <div className="bg-gray-200 h-52 w-full rounded-2xl mb-6"></div>
                <div className="space-y-3 flex-grow">
                  <div className="bg-gray-200 h-4 w-1/3 rounded"></div>
                  <div className="bg-gray-200 h-6 w-3/4 rounded"></div>
                  <div className="bg-gray-200 h-4 w-5/6 rounded"></div>
                </div>
                <div className="bg-gray-200 h-10 w-full rounded-xl mt-6"></div>
              </div>
            ))}
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <span className="text-5xl mb-4 block">🗺️</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Packages Available</h3>
            <p className="text-gray-500">We are currently updating packages for this region. Please try again soon!</p>
          </div>
        ) : (
          /* Packages Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-500">
            {filteredPackages.map((pkg) => {
              const waMsg = `Hi! I am interested in booking the "${pkg.title}" (${pkg.id}) package.`
              const detailUrl = `/packages/${pkg.id}`

              return (
                <div 
                  key={pkg.id} 
                  className="bg-white rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between group h-full transform hover:-translate-y-1"
                >
                  {/* Image & Badges */}
                  <div className="relative h-60 w-full overflow-hidden rounded-t-[28px]">
                    <img 
                      src={pkg.image || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80'} 
                      alt={pkg.title} 
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80' }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-750 ease-out"
                    />
                    
                    {/* Destination/Theme Badge */}
                    {pkg.badge && (
                      <div 
                        className="absolute bottom-4 left-4 text-white text-[12px] font-bold px-3 py-1.5 rounded-full shadow-sm"
                        style={{ backgroundColor: pkg.badgeColor || '#16294D' }}
                      >
                        {pkg.badge}
                      </div>
                    )}

                    {/* Duration Badge */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Calendar size={12} />
                      {pkg.duration}
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      {/* Hotels/Stays info */}
                      {pkg.hotels && (
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold mb-2.5">
                          <MapPin size={13} className="text-[#16294D]" />
                          <span className="truncate">{pkg.hotels}</span>
                        </div>
                      )}

                      <h3 className="text-xl font-heading font-bold text-gray-900 leading-snug tracking-tight mb-2.5 group-hover:text-[#16294D] transition-colors line-clamp-2">
                        {pkg.title}
                      </h3>

                      {pkg.subtitle && (
                        <p className="text-gray-500 text-sm mb-4 line-clamp-1">
                          {pkg.subtitle}
                        </p>
                      )}

                      {/* Bullet Highlights */}
                      {pkg.highlights && pkg.highlights.length > 0 && (
                        <div className="space-y-2 mb-6">
                          {pkg.highlights.slice(0, 3).map((hl, index) => (
                            <div key={index} className="flex items-start gap-2 text-gray-600 text-xs">
                              <CheckCircle2 size={13} className="text-green-500 mt-0.5 shrink-0" />
                              <span className="line-clamp-1">{hl}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pricing & CTA buttons */}
                    <div>
                      {/* Price Section */}
                      <div className="flex flex-col mb-5 pt-4 border-t border-gray-100">
                        {pkg.originalPrice && pkg.originalPrice > pkg.salePrice ? (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[#8C9BA5] text-sm line-through font-medium">
                              {fmt(pkg.originalPrice)}
                            </span>
                            <span className="bg-[#E7F6EC] text-[#22C55E] text-[11px] font-bold px-2 py-0.5 rounded-md">
                              SAVE {fmt(pkg.originalPrice - pkg.salePrice)}
                            </span>
                          </div>
                        ) : null}
                        <div className="flex items-baseline gap-1">
                          <span className="text-gray-500 text-xs">Starting from</span>
                          <span className="text-gray-900 font-heading font-bold text-2xl">
                            {fmt(pkg.salePrice) || 'On Request'}
                          </span>
                          <span className="text-gray-500 text-[10px] font-medium">/Person</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <a 
                          href={`tel:+${phone}`} 
                          title="Call Agency"
                          className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-300 shrink-0 cursor-pointer"
                        >
                          <Phone size={16} />
                        </a>
                        <a
                          href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(waMsg)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Chat on WhatsApp"
                          className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center text-[#25D366] hover:bg-green-50 transition-all duration-300 shrink-0 cursor-pointer"
                        >
                          <MessageCircle size={17} />
                        </a>
                        <Link
                          href={detailUrl}
                          className="flex-grow flex items-center justify-center gap-1 bg-[#16294D] text-white hover:bg-[#0E1B33] font-bold py-3 px-4 rounded-full text-sm text-center transition-all duration-300 shadow-md shadow-[#2F5490]/10 hover:shadow-[#2F5490]/20 cursor-pointer"
                        >
                          <span>View Itinerary</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </section>
  )
}
