'use client'
import MagneticButton from './MagneticButton'
import { ArrowRight, Calendar, MessageCircle, Phone } from 'lucide-react'

export default function HeroSection() {
  return (
    <section style={{
      padding: '120px 24px 80px',
      background: '#FAF7EC',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background World Map Vector or Pattern could go here */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(230,213,195,0.4) 0%, rgba(251,248,241,0) 70%)',
        zIndex: 0
      }} />

      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 60,
        width: '100%',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Left Column: Typography & CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 800,
            color: '#111',
            lineHeight: 1.1,
            marginBottom: 24
          }}>
            Travel with <span style={{ color: '#C9A227' }}>Confidence.</span><br />
            Experience the <span style={{ color: '#8A6E1C' }}>Difference.</span>
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#555',
            marginBottom: 40,
            fontWeight: 500
          }}>
            25+ Years of Trusted Travel Expertise.
            Every journey deserves careful planning, honest guidance, and dependable support.
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <MagneticButton>
              <a href="#destinations" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', borderRadius: 999,
                background: '#C9A227', color: '#fff',
                fontWeight: 600, textDecoration: 'none',
                boxShadow: '0 10px 30px rgba(217,119,87,0.3)'
              }}>
                Explore Tours <ArrowRight size={18} />
              </a>
            </MagneticButton>
            <MagneticButton>
              <a href="#plan" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', borderRadius: 999,
                background: '#fff', color: '#111',
                fontWeight: 600, textDecoration: 'none',
                border: '1.5px solid #C9A227'
              }}>
                Plan My Holiday <Calendar size={18} />
              </a>
            </MagneticButton>
            <MagneticButton>
              <a href="#contact" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', borderRadius: 999,
                background: '#fff', color: '#111',
                fontWeight: 600, textDecoration: 'none',
                border: '1px solid #e5e7eb'
              }}>
                Contact Us <Phone size={18} />
              </a>
            </MagneticButton>
            <MagneticButton>
              <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', borderRadius: 999,
                background: '#25D366', color: '#fff',
                fontWeight: 600, textDecoration: 'none',
                boxShadow: '0 10px 30px rgba(37,211,102,0.3)'
              }}>
                WhatsApp <MessageCircle size={18} />
              </a>
            </MagneticButton>
          </div>
        </div>

        {/* Right Column: Visuals */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <img 
              src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80" 
              alt="India Travel"
              style={{ width: '100%', borderRadius: 24, height: 320, objectFit: 'cover' }}
            />
            <img 
              src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80" 
              alt="Beach Holiday"
              style={{ width: '100%', borderRadius: 24, height: 240, objectFit: 'cover' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: -80 }}>
            <img 
              src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80" 
              alt="Mountain Tour"
              style={{ width: '100%', borderRadius: 24, height: 240, objectFit: 'cover' }}
            />
            <img 
              src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80" 
              alt="Lake View"
              style={{ width: '100%', borderRadius: 24, height: 320, objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
