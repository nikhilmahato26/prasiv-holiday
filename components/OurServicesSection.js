'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const services = [
  { title: 'Domestic Tour Packages', image: 'https://images.unsplash.com/photo-1593693397690-362cb9666cb3?auto=format&fit=crop&w=600&q=80' },
  { title: 'Family Holidays', image: 'https://images.unsplash.com/photo-1536697246787-1f276329ee4c?auto=format&fit=crop&w=600&q=80' },
  { title: 'Honeymoon Tours', image: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=600&q=80' },
  { title: 'Pilgrimage Tours', image: 'https://images.unsplash.com/photo-1587869614488-7e3e2327a4f9?auto=format&fit=crop&w=600&q=80' },
  { title: 'Group Tours', image: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=600&q=80' },
  { title: 'Corporate Tours', image: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=600&q=80' },
  { title: 'Flight Booking', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80' },
  { title: 'Railway Reservation', image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80' },
  { title: 'Hotel Booking', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80' },
  { title: 'Car Rental', image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80' },
  { title: 'Customized Holidays', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80' }
]

export default function OurServicesSection() {
  const container = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.service-card', {
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
    <section id="services" ref={container} style={{ padding: '100px 24px', background: '#FAF7EC' }}>
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
            What We Do
          </p>
          <h2 style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            color: '#111',
            lineHeight: 1.2
          }}>
            Our <span style={{ color: '#8A6E1C' }}>Services</span>
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24
        }}>
          {services.map((service, idx) => (
            <div key={idx} className="service-card" style={{
              position: 'relative',
              borderRadius: 24,
              overflow: 'hidden',
              height: 320,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.querySelector('img').style.transform = 'scale(1.05)'
              e.currentTarget.querySelector('.service-title').style.transform = 'translateY(-8px)'
              e.currentTarget.querySelector('.service-arrow').style.opacity = '1'
              e.currentTarget.querySelector('.service-arrow').style.transform = 'translateX(0)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.querySelector('img').style.transform = 'scale(1)'
              e.currentTarget.querySelector('.service-title').style.transform = 'translateY(0)'
              e.currentTarget.querySelector('.service-arrow').style.opacity = '0'
              e.currentTarget.querySelector('.service-arrow').style.transform = 'translateX(-10px)'
            }}
            >
              <img 
                src={service.image} 
                alt={service.title}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)'
              }} />
              <div style={{
                position: 'absolute',
                bottom: 30,
                left: 30,
                right: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <h3 className="service-title" style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: '#fff',
                  margin: 0,
                  transition: 'transform 0.3s ease'
                }}>{service.title}</h3>
                <div className="service-arrow" style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#C9A227',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transform: 'translateX(-10px)',
                  transition: 'all 0.3s ease'
                }}>
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
