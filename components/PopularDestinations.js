'use client'
import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MapPin } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const indiaDestinations = [
  { name: 'Gujarat', image: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=600&q=80' },
  { name: 'Kashmir', image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80' },
  { name: 'Himachal Pradesh', image: 'https://images.unsplash.com/photo-1626014903706-538356bb0d3f?auto=format&fit=crop&w=600&q=80' },
  { name: 'Uttarakhand', image: 'https://images.unsplash.com/photo-1626714246872-97b777a83d3e?auto=format&fit=crop&w=600&q=80' },
  { name: 'Goa', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80' },
  { name: 'Kerala', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80' },
  { name: 'Maharashtra', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80' },
  { name: 'Tamil Nadu', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f7415e?auto=format&fit=crop&w=600&q=80' },
  { name: 'Odisha', image: 'https://images.unsplash.com/photo-1632731553880-9984918e77ce?auto=format&fit=crop&w=600&q=80' },
  { name: 'Sikkim', image: 'https://images.unsplash.com/photo-1592398414441-2b0051e50669?auto=format&fit=crop&w=600&q=80' },
  { name: 'Darjeeling', image: 'https://images.unsplash.com/photo-1544331454-e6ee53676100?auto=format&fit=crop&w=600&q=80' },
  { name: 'Meghalaya', image: 'https://images.unsplash.com/photo-1582885448375-71ea865511b8?auto=format&fit=crop&w=600&q=80' },
  { name: 'Andaman & Nicobar', image: 'https://images.unsplash.com/photo-1570077977051-fb18659dcc88?auto=format&fit=crop&w=600&q=80' },
  { name: 'Leh Ladakh', image: 'https://images.unsplash.com/photo-1596700078864-5390979a0ebf?auto=format&fit=crop&w=600&q=80' }
]

const internationalDestinations = [
  { name: 'Thailand', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80' },
  { name: 'Bali', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80' },
  { name: 'Vietnam', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80' },
  { name: 'Dubai', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80' },
  { name: 'Bhutan', image: 'https://images.unsplash.com/photo-1581403061298-6e3e56a7356c?auto=format&fit=crop&w=600&q=80' }
]

export default function PopularDestinations() {
  const [activeTab, setActiveTab] = useState('india')
  const container = useRef(null)

  const displayedDestinations = activeTab === 'india' ? indiaDestinations : internationalDestinations

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.dest-card', {
        y: 30,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        stagger: 0.05,
        duration: 0.6,
        ease: 'power2.out'
      })
    }, container)
    return () => ctx.revert()
  }, [activeTab])

  return (
    <section id="destinations" ref={container} style={{ padding: '100px 24px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#C9A227',
            marginBottom: 12
          }}>
            Explore The World
          </p>
          <h2 style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            color: '#111',
            lineHeight: 1.2
          }}>
            Popular <span style={{ color: '#8A6E1C' }}>Destinations</span>
          </h2>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 48 }}>
          <button 
            onClick={() => setActiveTab('india')}
            style={{
              padding: '12px 32px',
              borderRadius: 999,
              background: activeTab === 'india' ? '#8A6E1C' : '#f3f4f6',
              color: activeTab === 'india' ? '#fff' : '#111',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
            India
          </button>
          <button 
            onClick={() => setActiveTab('international')}
            style={{
              padding: '12px 32px',
              borderRadius: 999,
              background: activeTab === 'international' ? '#8A6E1C' : '#f3f4f6',
              color: activeTab === 'international' ? '#fff' : '#111',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
            Out of India
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20
        }}>
          {displayedDestinations.map((dest, idx) => (
            <div key={`${activeTab}-${idx}`} className="dest-card" style={{
              position: 'relative',
              borderRadius: 20,
              overflow: 'hidden',
              height: 280,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.querySelector('img').style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.querySelector('img').style.transform = 'scale(1)'
            }}
            >
              <img 
                src={dest.image} 
                alt={dest.name}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)'
              }} />
              <div style={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <MapPin size={18} color="#C9A227" />
                <h3 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: '#fff',
                  margin: 0
                }}>{dest.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
