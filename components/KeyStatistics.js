'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Award, Users, Map, Star, Compass } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const stats = [
  { icon: Award, value: '15+', label: 'Years of Experience' },
  { icon: Users, value: '25,000+', label: 'Happy Travellers' },
  { icon: Compass, value: '250+', label: 'Packages Delivered Last Year' },
  { icon: Map, value: 'Pan India', label: 'Travel Services' },
  { icon: Star, value: '4.8/5', label: 'Google Rated Company' },
]

export default function KeyStatistics() {
  const container = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.stat-item', {
        y: 40,
        opacity: 0
      }, {
        scrollTrigger: {
          trigger: container.current,
          start: 'top 80%',
        },
        y: 0,
        opacity: 1,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out'
      })
    }, container)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={container} style={{
      padding: '40px 24px',
      background: '#fff',
      borderBottom: '1px solid #f0f0f0'
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '40px',
        alignItems: 'center'
      }}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="stat-item" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '16px 24px',
              background: '#FAF7EC',
              borderRadius: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              minWidth: 220
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#C9A227',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={24} />
              </div>
              <div>
                <h3 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  color: '#111',
                  margin: 0
                }}>{stat.value}</h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#666',
                  margin: 0,
                  fontWeight: 500
                }}>{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
