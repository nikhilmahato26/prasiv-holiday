'use client'
import { useState, useEffect } from 'react'

export default function TeamSection() {
  const [team, setTeam] = useState([])

  useEffect(() => {
    fetch('/api/team')
      .then(res => res.ok ? res.json() : [])
      .then(data => setTeam(data))
      .catch(err => console.error('Error fetching team:', err))
  }, [])

  if (!team || team.length === 0) return null

  return (
    <section style={{ padding: '80px 24px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#8A6E1C', marginBottom: 10 }}>
            Our People
          </p>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#111', marginBottom: 12 }}>
            Meet <span style={{ color: '#8A6E1C' }}>Our Team</span>
          </h2>
          <p style={{ color: '#6b7280', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            The passionate individuals who make your travel experiences unforgettable.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '32px', justifyContent: 'center' }}>
          {team.map(member => (
            <div key={member.id} style={{
              background: '#fafafa',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              cursor: 'default',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)' }}
            >
              <div style={{ position: 'relative', width: '100%', paddingTop: '100%' }}>
                <img src={member.image_url} alt={member.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '24px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#111' }}>{member.name}</h3>
                <p style={{ margin: '8px 0 0', color: '#8A6E1C', fontSize: '0.9rem', fontWeight: 600 }}>{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
