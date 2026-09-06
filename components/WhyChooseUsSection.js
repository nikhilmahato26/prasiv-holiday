'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CheckCircle2, Shield, Heart, Map, Clock, Zap, CreditCard, Headphones, Building, Plane } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const reasons = [
  { icon: Clock, title: '15+ Years Experience', desc: 'Decades of trusted service in the travel industry.' },
  { icon: Heart, title: 'Personalized Tour Planning', desc: 'Tailor-made itineraries crafted just for you.' },
  { icon: Building, title: 'Direct Hotel Partnerships', desc: 'Best rates and exclusive perks at top properties.' },
  { icon: Map, title: 'Direct Vehicle Network', desc: 'Reliable transport solutions across all destinations.' },
  { icon: Plane, title: 'Competitive Flight Fares', desc: 'Access to special fares and exclusive discounts.' },
  { icon: Map, title: 'Railway Reservation Experts', desc: 'Hassle-free train bookings and planning.' },
  { icon: Map, title: 'Journey Monitoring', desc: 'We track your journey to ensure everything goes smoothly.' },
  { icon: Zap, title: 'Fast Problem Resolution', desc: 'Immediate assistance if anything unexpected occurs.' },
  { icon: CreditCard, title: 'Transparent Pricing', desc: 'No hidden fees. You know exactly what you pay for.' },
  { icon: Headphones, title: 'Dedicated Customer Support', desc: '24/7 assistance before, during, and after your trip.' }
]

export default function WhyChooseUsSection() {
  const container = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.reason-card', {
        y: 50,
        opacity: 0
      }, {
        scrollTrigger: {
          trigger: container.current,
          start: 'top 75%'
        },
        y: 0,
        opacity: 1,
        stagger: 0.05,
        duration: 0.6,
        ease: 'back.out(1.7)'
      })
    }, container)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={container} style={{ padding: '100px 24px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#C9A227',
            marginBottom: 12
          }}>
            The Prashiv Holiday Advantage
          </p>
          <h2 style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            color: '#111',
            lineHeight: 1.2
          }}>
            Why Choose <span style={{ color: '#8A6E1C' }}>Us?</span>
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 24
        }}>
          {reasons.map((reason, idx) => {
            const Icon = reason.icon
            return (
              <div key={idx} className="reason-card" style={{
                background: '#FAF7EC',
                padding: '32px 24px',
                borderRadius: 24,
                textAlign: 'left',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'
                e.currentTarget.style.borderColor = '#C9A227'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = 'transparent'
              }}
              >
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  color: '#C9A227',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  <Icon size={28} strokeWidth={1.5} />
                </div>
                <h3 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: '#111',
                  marginBottom: 12,
                  lineHeight: 1.3
                }}>{reason.title}</h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  lineHeight: 1.6
                }}>{reason.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
