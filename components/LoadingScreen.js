'use client'
import { useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { Plane } from 'lucide-react'

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Basic GSAP animation for the loader
    const tl = gsap.timeline({
      onComplete: () => setLoading(false)
    })

    tl.to('.loader-plane', {
      x: '100vw',
      y: '-20vh',
      duration: 2,
      ease: 'power2.inOut'
    })
    .to('.loader-overlay', {
      yPercent: -100,
      duration: 1,
      ease: 'power4.inOut',
      delay: 0.2
    }, "-=1")

  }, [])

  if (!loading) return null

  return (
    <div className="loader-overlay" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: '#FAF7EC',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#8A6E1C'
    }}>
      <Plane className="loader-plane" size={48} />
      <h2 style={{
        marginTop: 24,
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 700,
        fontSize: '1.5rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }}>
        Prashiv Holiday
      </h2>
    </div>
  )
}
