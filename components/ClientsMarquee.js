'use client'
import { useState, useEffect } from 'react'

export default function ClientsMarquee() {
  const [clients, setClients] = useState([])

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.ok ? res.json() : [])
      .then(data => setClients(data))
      .catch(err => console.error('Error fetching clients:', err))
  }, [])

  if (!clients || clients.length === 0) return null

  // Duplicate for seamless scroll
  const marqueeItems = [...clients, ...clients, ...clients, ...clients]

  return (
    <section style={{ padding: '60px 24px', background: '#fafafa', overflow: 'hidden', borderTop: '1px solid #eaeaea' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center', marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#8A6E1C', marginBottom: 10 }}>
          Our Trusted Partners
        </p>
        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#111' }}>
          Our Hospitality <span style={{ color: '#8A6E1C' }}>Partners</span>
        </h2>
      </div>

      <div style={{ position: 'relative', width: '100vw', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', overflow: 'hidden' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes scroll-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .client-marquee-track {
            display: flex;
            width: max-content;
            animation: scroll-marquee 60s linear infinite;
          }
          .client-marquee-track:hover {
            animation-play-state: paused;
          }
          .client-logo-item {
            flex: 0 0 auto;
            width: 150px;
            height: 80px;
            margin: 0 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            filter: grayscale(100%) opacity(0.7);
            transition: filter 0.3s, transform 0.3s;
          }
          .client-logo-item:hover {
            filter: grayscale(0%) opacity(1);
            transform: scale(1.05);
          }
          .client-logo-item img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
        `}} />
        <div className="client-marquee-track">
          {marqueeItems.map((client, i) => (
            <div key={`${client.id}-${i}`} className="client-logo-item" title={client.name}>
              <img src={client.logo_url} alt={client.name} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
