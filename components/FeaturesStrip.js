'use client'
import { Shield, Clock, MapPin, BadgeCheck, Car, Phone } from 'lucide-react'

const FEATURES = [
  { icon: Shield, title: 'Safe Journey', desc: 'Verified drivers' },
  { icon: Clock, title: '24/7 Available', desc: 'Round the clock' },
  { icon: MapPin, title: 'Door-to-Door', desc: 'Pickup anywhere' },
  { icon: BadgeCheck, title: 'Licensed', desc: 'Govt registered' },
  { icon: Car, title: 'Luxury Fleet', desc: 'Premium vehicles' },
  { icon: Phone, title: 'Instant Booking', desc: 'Call to book' }
]

export default function FeaturesStrip() {
  return (
    <section style={{ padding: '60px 24px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {FEATURES.map((item, idx) => (
            <div key={idx} style={{ 
              background: '#FAF7EC', 
              borderRadius: 12, 
              padding: '28px 16px', 
              textAlign: 'center',
              border: '1px solid #f0e6d2',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.border = '1px solid rgba(126, 82, 51, 0.4)'
              e.currentTarget.style.background = '#fff'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(126, 82, 51, 0.08)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.border = '1px solid #f0e6d2'
              e.currentTarget.style.background = '#FAF7EC'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            >
              <div style={{ 
                width: 44, height: 44, borderRadius: '50%', 
                background: 'rgba(201, 61, 0, 0.1)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <item.icon size={20} style={{ color: '#8A6E1C' }} strokeWidth={1.5} />
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#111', marginBottom: 6 }}>{item.title}</h3>
                <p style={{ fontSize: 11, color: '#6b7280' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
