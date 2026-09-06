'use client'
import { CheckCircle2 } from 'lucide-react'

export default function TrustSection() {
  const points = [
    "Access to 5,000+ hotels across India & abroad",
    "Best available corporate & holiday rates",
    "Luxury, premium, and budget accommodation options",
    "Instant hotel confirmations",
    "24×7 travel assistance",
    "Customized stays for families, corporates & groups",
    "Trusted travel planning from booking to checkout"
  ]

  return (
    <section style={{ padding: '80px 24px', background: '#fff' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#8A6E1C', marginBottom: 10 }}>
            Our Guarantee
          </p>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#111', marginBottom: 12 }}>
            Why Customers <span style={{ color: '#8A6E1C' }}>Trust Us</span>
          </h2>
          <p style={{ color: '#6b7280', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            We take pride in providing exceptional service and peace of mind at every step of your journey.
          </p>
        </div>

        <div style={{ background: '#FAF7EC', borderRadius: 24, padding: '40px 32px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {points.map((point, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <CheckCircle2 size={24} style={{ color: '#8A6E1C', flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 16, fontWeight: 600, color: '#374151', lineHeight: 1.5 }}>
                  {point}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
