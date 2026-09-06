'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Star, Play, Image as ImageIcon, MessageSquare } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function PremiumTrustSection() {
  const container = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.trust-card', {
        y: 40,
        opacity: 0
      }, {
        scrollTrigger: {
          trigger: container.current,
          start: 'top 80%'
        },
        y: 0,
        opacity: 1,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power2.out'
      })
    }, container)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={container} style={{ padding: '100px 24px', background: '#111', color: '#fff' }}>
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
            Trusted by Thousands
          </p>
          <h2 style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            lineHeight: 1.2
          }}>
            Real <span style={{ color: '#C9A227' }}>Experiences</span>
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24
        }}>
          {/* Google Reviews */}
          <div className="trust-card" style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24,
            padding: 40,
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 16 }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={24} fill="#FABB05" color="#FABB05" />)}
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8, fontFamily: 'Poppins, sans-serif' }}>4.8/5 Rating</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>Based on 500+ reviews on Google</p>
            <a href="#" style={{
              display: 'inline-block', padding: '12px 24px',
              border: '1px solid #fff', borderRadius: 999,
              color: '#fff', textDecoration: 'none', fontWeight: 600,
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#111' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff' }}
            >
              Read Google Reviews
            </a>
          </div>

          {/* Customer Testimonials */}
          <div className="trust-card" style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24,
            padding: 40,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MessageSquare size={48} color="#C9A227" style={{ marginBottom: 20 }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8, fontFamily: 'Poppins, sans-serif' }}>Testimonials</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>Hear what our happy travellers have to say.</p>
            <a href="#" style={{ color: '#C9A227', fontWeight: 600, textDecoration: 'underline' }}>View All</a>
          </div>

          {/* Photo Gallery */}
          <div className="trust-card" style={{
            background: 'url(https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80) center/cover',
            borderRadius: 24,
            padding: 40,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <ImageIcon size={48} color="#fff" style={{ marginBottom: 20 }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8, fontFamily: 'Poppins, sans-serif' }}>Photo Gallery</h3>
              <a href="#" style={{ color: '#fff', fontWeight: 600, textDecoration: 'underline' }}>View Memories</a>
            </div>
          </div>

          {/* Video Gallery */}
          <div className="trust-card" style={{
            background: 'url(https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=600&q=80) center/cover',
            borderRadius: 24,
            padding: 40,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Play size={48} color="#fff" fill="#fff" style={{ marginBottom: 20 }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8, fontFamily: 'Poppins, sans-serif' }}>Video Gallery</h3>
              <a href="#" style={{ color: '#fff', fontWeight: 600, textDecoration: 'underline' }}>Watch Journeys</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
