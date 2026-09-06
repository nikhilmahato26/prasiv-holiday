'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PackageCard from '@/components/PackageCard'
import { usePackages } from '@/hooks/usePackages'
import { usePhone } from '@/hooks/useSettings'

export default function PackagesPage() {
  const [region, setRegion] = useState('domestic')
  const [activeDest, setActiveDest] = useState('all')
  const [destinations, setDestinations] = useState([])
  const { packages, loaded: pkgsLoaded } = usePackages()
  const phone = usePhone()

  useEffect(() => {
    fetch('/api/destinations')
      .then(r => (r.ok ? r.json() : []))
      .then(rows => setDestinations(Array.isArray(rows) ? rows : []))
      .catch(() => setDestinations([]))
  }, [])

  // Packages written before the domestic/international split have no region.
  const regionOf = p => p.region || 'domestic'
  const regionPackages = packages.filter(p => regionOf(p) === region)

  // Only offer tabs for destinations that actually have live packages in this
  // region, so the seed's broader category list never produces an empty tab.
  const pkgDestinations = new Set(regionPackages.map(p => p.destination).filter(Boolean))
  const shownDestinations = destinations.filter(d => pkgDestinations.has(d.name))

  // A destination held over from the other region has no tab here, so resolve
  // it back to "all" during render rather than in an effect.
  const activeDestination = pkgDestinations.has(activeDest) ? activeDest : 'all'

  const shown = regionPackages.filter(p => {
    return activeDestination === 'all' || p.destination === activeDestination
  })

  const REGIONS = [
    { key: 'domestic', label: 'Domestic', count: packages.filter(p => regionOf(p) === 'domestic').length },
    { key: 'international', label: 'International', count: packages.filter(p => regionOf(p) === 'international').length },
  ]

  return (
    <main style={{ minHeight: '100vh', background: '#fff', paddingTop: 80 }}>
      <Navbar />
      
{/* ── Packages ── */}
      <section id="packages" style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#8A6E1C', marginBottom: 10 }}>
              Curated Experiences
            </p>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#111', marginBottom: 12 }}>
              Our <span style={{ color: '#8A6E1C' }}>Packages</span>
            </h2>
            <p style={{ color: '#9ca3af', maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.6 }}>
              Every package includes a day-wise itinerary, accommodation & transfers.
            </p>

            {/* Domestic / International switch */}
            <div style={{ display: 'inline-flex', gap: 6, padding: 6, borderRadius: 999, background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 22 }}>
              {REGIONS.map(r => (
                <button
                  key={r.key}
                  onClick={() => { setRegion(r.key); setActiveDest('all') }}
                  aria-pressed={region === r.key}
                  style={{
                    padding: '9px 26px', borderRadius: 999, fontSize: 13, fontWeight: 700, letterSpacing: '0.02em',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    background: region === r.key ? '#16294D' : 'transparent',
                    color: region === r.key ? '#fff' : '#6b7280',
                  }}>
                  {r.label}
                  {r.count > 0 && (
                    <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: region === r.key ? '#C9A227' : '#9ca3af' }}>{r.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Category tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
              <button
                onClick={() => setActiveDest('all')}
                style={{
                  padding: '8px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: activeDestination === 'all' ? 'linear-gradient(135deg,#8A6E1C,#8A6E1C)' : '#F3EFE1',
                  color: activeDestination === 'all' ? '#fff' : '#555',
                }}>
                All Categories
              </button>
              {shownDestinations.map(d => (
                <button
                  key={d.id}
                  onClick={() => setActiveDest(d.name)}
                  style={{
                    padding: '8px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    background: activeDestination === d.name ? 'linear-gradient(135deg,#8A6E1C,#8A6E1C)' : '#F3EFE1',
                    color: activeDestination === d.name ? '#fff' : '#555',
                  }}>
                  {d.name}
                </button>
              ))}
            </div>
          </div>

          {!pkgsLoaded ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
              <div style={{ width: 36, height: 36, border: '3px solid #FAF7EC', borderTop: '3px solid #8A6E1C', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              <p style={{ fontSize: 14 }}>Loading packages...</p>
            </div>
          ) : shown.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
              <p>No packages available for this selection.</p>
              <button onClick={() => { setActiveDest('all') }} style={{ marginTop: 12, padding: '8px 20px', borderRadius: 999, border: 'none', background: '#F3EFE1', color: '#555', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {shown.map(pkg => <PackageCard key={pkg.id} pkg={pkg} phone={phone} />)}
            </div>
          )}
        </div>
      </section>

      

      <Footer />
    </main>
  )
}
