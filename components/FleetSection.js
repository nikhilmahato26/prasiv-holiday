'use client'
import { useState, useEffect } from 'react'
import { Phone } from 'lucide-react'

export default function FleetSection({ phone }) {
  const [fleet, setFleet] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/fleet')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setFleet(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching fleet:', err)
        setLoading(false)
      })
  }, [])

  if (!loading && fleet.length === 0) return null

  return (
    <section id="fleet" style={{ padding: '80px 24px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#8A6E1C', marginBottom: 10 }}>
            Travel in Comfort
          </p>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#111', marginBottom: 12 }}>
            Our <span style={{ color: '#8A6E1C' }}>Fleet Options</span>
          </h2>
          <p style={{ color: '#6b7280', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
            Choose the perfect vehicle for your group size and travel needs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, height: 380, border: '1px solid #e5e7eb', animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
            ))
          ) : (
            fleet.map(vehicle => (
              <div key={vehicle.id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: 140, background: '#f9fafb' }}>
                  <img src={vehicle.img} alt={vehicle.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', top: 10, left: 10, background: vehicle.tagBg, color: vehicle.tagColor, fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 999, textTransform: 'uppercase' }}>
                    {vehicle.tag}
                  </span>
                  <span style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(255,255,255,0.95)', color: '#374151', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    👥 {vehicle.capacity}{/seat/i.test(vehicle.capacity) ? '' : ' Seats'}
                  </span>
                </div>
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 2, textTransform: 'uppercase' }}>{vehicle.category}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111', marginBottom: 6 }}>{vehicle.name}</h3>
                  <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4, marginBottom: 12 }}>{vehicle.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20, marginTop: 'auto' }}>
                    {(vehicle.features || []).map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#4b5563' }}>
                        <span style={{ color: '#8b5cf6', fontSize: 14 }}>⊙</span> {f}
                      </div>
                    ))}
                  </div>
                  <a href={`tel:+${phone}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '8px 0', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontWeight: 700, fontSize: 11, textDecoration: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <Phone size={12} style={{ color: '#fbbf24' }} /> BOOK THIS VEHICLE
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
