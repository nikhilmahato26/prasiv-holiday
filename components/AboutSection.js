'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Star, Clock, Shield, Users } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function AboutSection() {
  const container = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.about-fade', {
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
        ease: 'power3.out'
      })
    }, container)
    return () => ctx.revert()
  }, [])

  return (
    <section id="about" ref={container} style={{ padding: '100px 24px', background: '#FAF7EC' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 56, alignItems: 'center' }}>
          
          {/* Left Column: Text & Features */}
          <div className="about-fade">
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A227', marginBottom: 12 }}>
              About the Company
            </p>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#111', marginBottom: 16, lineHeight: 1.1 }}>
              We Create Memorable <span style={{ color: '#8A6E1C' }}>Travel Experiences</span>
            </h2>
            <p style={{ color: '#555', lineHeight: 1.7, marginBottom: 32, fontSize: '1.05rem' }}>
              Every journey deserves careful planning, honest guidance, and dependable support. At Prashiv Holiday, customer satisfaction is always our highest priority. We don&apos;t just book holidays—we design journeys that craft lifelong memories.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { icon: Star,   t: 'Customized Holidays', d: 'Tailor-made itineraries for you' },
                { icon: Clock,  t: '24/7 Support',        d: 'Journey monitoring & resolution' },
                { icon: Shield, t: 'Safe Travels',        d: 'Direct hotel & transport network' },
                { icon: Users,  t: 'Group Tours',         d: 'Family & pilgrimage experts' },
              ].map(({ icon: I, t, d }) => (
                <div key={t} style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FAF7EC', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <I size={18} style={{ color: '#C9A227' }} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{t}</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4, lineHeight: 1.4 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visuals & Founder */}
          <div className="about-fade" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', aspectRatio: '16/10' }}>
                <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80" alt="Beautiful Travel Landscape" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ position: 'absolute', bottom: -20, left: 24, background: '#fff', borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.08)', padding: '16px 24px', border: '1px solid rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#8A6E1C', lineHeight: 1 }}>25,000+</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4, fontWeight: 500 }}>Happy Travellers</div>
              </div>
            </div>
            
            {/* Brand promise */}
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', background: '#fff', padding: 24, borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
              <div style={{ width: 80, height: 80, borderRadius: 16, overflow: 'hidden', flexShrink: 0, background: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                <img src="/logo.png" alt="Prashiv Holiday" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }} />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#111', margin: 0 }}>Prashiv Holiday</h4>
                <p style={{ fontSize: 13, color: '#8A6E1C', fontWeight: 600, margin: '4px 0 0' }}>Your Travel Partner</p>
                <p style={{ fontSize: 13, color: '#666', margin: '8px 0 0', lineHeight: 1.4 }}>
                  &ldquo;We don&apos;t just book holidays—we create memorable travel experiences.&rdquo;
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
