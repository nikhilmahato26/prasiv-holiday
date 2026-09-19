'use client'
import { useState, useEffect } from 'react'

export default function CampaignSlider({ images, title, name }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % images.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [images])

  if (!images || images.length === 0) return null

  return (
    <>
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={title || name}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: current === idx ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            zIndex: 0
          }}
        />
      ))}
      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8, zIndex: 5 }}>
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              style={{
                width: current === idx ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: current === idx ? '#C14B00' : 'rgba(255,255,255,0.5)',
                border: 'none',
                transition: 'all 0.3s',
                cursor: 'pointer',
                padding: 0
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </>
  )
}
