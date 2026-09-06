'use client'
import { useState } from 'react'

export default function BookingFormsSection() {
  const [activeTab, setActiveTab] = useState('package')

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    background: isActive ? '#C9A227' : '#f3f4f6',
    color: isActive ? '#fff' : '#111',
    fontWeight: 600,
    border: 'none',
    borderRadius: '999px',
    cursor: 'pointer',
    transition: 'all 0.3s'
  })

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    background: '#fff',
    outline: 'none',
    marginBottom: 16,
    fontFamily: 'inherit'
  }

  const btnStyle = {
    width: '100%',
    padding: '16px',
    background: '#8A6E1C',
    color: '#fff',
    fontWeight: 700,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    marginTop: 8
  }

  return (
    <section id="plan" style={{ padding: '100px 24px', background: '#FAF7EC' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', background: '#fff', borderRadius: 24, padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 800,
            color: '#111',
            marginBottom: 12
          }}>
            Plan Your <span style={{ color: '#C9A227' }}>Journey</span>
          </h2>
          <p style={{ color: '#666' }}>Select the service you need and let us handle the rest.</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 40 }}>
          <button style={tabStyle(activeTab === 'package')} onClick={() => setActiveTab('package')}>Package Inquiry</button>
          <button style={tabStyle(activeTab === 'flight')} onClick={() => setActiveTab('flight')}>Flight Booking</button>
          <button style={tabStyle(activeTab === 'train')} onClick={() => setActiveTab('train')}>Railway Reservation</button>
        </div>

        {activeTab === 'package' && (
          <form onSubmit={e => e.preventDefault()}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <input type="text" placeholder="Your Name" style={inputStyle} required />
              <input type="email" placeholder="Email Address" style={inputStyle} required />
              <input type="tel" placeholder="Phone Number" style={inputStyle} required />
              <input type="text" placeholder="Destination" style={inputStyle} required />
            </div>
            <textarea placeholder="Tell us about your dream holiday..." style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}></textarea>
            <button style={btnStyle}>Inquire Now</button>
          </form>
        )}

        {activeTab === 'flight' && (
          <form onSubmit={e => e.preventDefault()}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <input type="text" placeholder="From (City/Airport)" style={inputStyle} required />
              <input type="text" placeholder="To (City/Airport)" style={inputStyle} required />
              <input type="date" style={inputStyle} required />
              <input type="number" placeholder="Passengers" min="1" style={inputStyle} required />
            </div>
            <input type="tel" placeholder="Your Phone Number" style={inputStyle} required />
            <button style={btnStyle}>Request Flight Quote</button>
          </form>
        )}

        {activeTab === 'train' && (
          <form onSubmit={e => e.preventDefault()}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <input type="text" placeholder="Departure Station" style={inputStyle} required />
              <input type="text" placeholder="Arrival Station" style={inputStyle} required />
              <input type="date" style={inputStyle} required />
              <select style={inputStyle} required>
                <option value="">Select Class</option>
                <option value="1A">1A (First AC)</option>
                <option value="2A">2A (Second AC)</option>
                <option value="3A">3A (Third AC)</option>
                <option value="SL">SL (Sleeper)</option>
              </select>
            </div>
            <input type="tel" placeholder="Your Phone Number" style={inputStyle} required />
            <button style={btnStyle}>Book Train Ticket</button>
          </form>
        )}
      </div>
    </section>
  )
}
