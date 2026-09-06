'use client'
import { MessageCircle } from 'lucide-react'
import MagneticButton from './MagneticButton'

export default function FloatingWhatsApp() {
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 9999
    }}>
      <MagneticButton>
        <a href="https://wa.me/917796950505?text=Hi%20Prashiv%20Holiday%2C%20I%20want%20to%20inquire%20about%20booking%20a%20trip." target="_blank" rel="noreferrer" style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          backgroundColor: '#25D366',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(37,211,102,0.4)',
          textDecoration: 'none'
        }}>
          <MessageCircle size={32} />
        </a>
      </MagneticButton>
    </div>
  )
}
