'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PackageCard from '@/components/PackageCard'
import { usePackages } from '@/hooks/usePackages'
import { usePhone } from '@/hooks/useSettings'

export default function PackagesPage() {
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

  const shown = packages.filter(p => {
    return activeDest === 'all' || p.destination === activeDest
  })

  // Only offer tabs for destinations that actually have live packages, so the
  // seed's broader category list never produces an empty tab.
  const pkgDestinations = new Set(packages.map(p => p.destination).filter(Boolean))
  const shownDestinations = destinations.filter(d => pkgDestinations.has(d.name))

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

            {/* Category tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
              <button
                onClick={() => setActiveDest('all')}
                style={{
                  padding: '8px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: activeDest === 'all' ? 'linear-gradient(135deg,#8A6E1C,#8A6E1C)' : '#F3EFE1',
                  color: activeDest === 'all' ? '#fff' : '#555',
                }}>
                All Categories
              </button>
              {shownDestinations.map(d => (
                <button
                  key={d.id}
                  onClick={() => setActiveDest(d.name)}
                  style={{
                    padding: '8px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    background: activeDest === d.name ? 'linear-gradient(135deg,#8A6E1C,#8A6E1C)' : '#F3EFE1',
                    color: activeDest === d.name ? '#fff' : '#555',
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
