'use client'
import { useState, useEffect } from 'react'
import { MapPin, Phone, Mail, Send } from 'lucide-react'
import { ALL_DESTINATIONS } from '@/lib/destinations-data'

export default function ContactSection({ phone, email, whatsapp }) {
  const [destinations, setDestinations] = useState([])
  const [enquiry, setEnquiry] = useState({ name: '', phone: '', email: '', destination: '', message: '' })
  const [status, setStatus] = useState(null) // null | 'sending' | 'sent' | 'error'

  useEffect(() => {
    setDestinations(ALL_DESTINATIONS)
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!enquiry.name.trim() || !enquiry.phone.trim()) return
    setStatus('sending')
    
    const msg = `Destination: ${enquiry.destination || 'Not specified'}\n\n${enquiry.message}`

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package_id: 'general-enquiry', package_title: 'General Enquiry', ...enquiry, message: msg }),
      })
      if (res.ok) { setStatus('sent'); setEnquiry({ name: '', phone: '', email: '', destination: '', message: '' }) }
      else setStatus('error')
    } catch { setStatus('error') }
  }

  const INPUT = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1.5px solid #e5e7eb', fontSize: 14, color: '#111',
    background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  }

  return (
    <section id="contact" style={{ padding: '80px 24px', background: '#FAF7EC' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#8A6E1C', marginBottom: 10 }}>
            Get In Touch
          </p>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#111', marginBottom: 12 }}>
            Contact <span style={{ color: '#8A6E1C' }}>Us</span>
          </h2>
          <p style={{ color: '#6b7280', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
            Ready to plan your trip? Fill out the form below or reach out to us directly.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40 }}>
          {/* Left Column: Form */}
          <div style={{ background: '#fff', padding: 32, borderRadius: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 24, color: '#111', marginBottom: 24 }}>Send an Inquiry</h3>
            {status === 'sent' ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Send size={28} style={{ color: '#16a34a' }} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 8 }}>Inquiry Sent!</h3>
                <p style={{ color: '#6b7280', fontSize: 15 }}>We&rsquo;ll get back to you shortly.</p>
                <button onClick={() => setStatus(null)} style={{ marginTop: 24, padding: '10px 24px', borderRadius: 999, border: 'none', background: '#f3f4f6', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>Send another</button>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 6, display: 'block' }}>Your Name *</label>
                    <input required value={enquiry.name} onChange={e => setEnquiry(v => ({ ...v, name: e.target.value }))} placeholder="John Doe" style={INPUT} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 6, display: 'block' }}>Phone Number *</label>
                    <input required value={enquiry.phone} onChange={e => setEnquiry(v => ({ ...v, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" style={INPUT} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 6, display: 'block' }}>Email Address</label>
                  <input value={enquiry.email} onChange={e => setEnquiry(v => ({ ...v, email: e.target.value }))} placeholder="john@example.com" style={INPUT} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 6, display: 'block' }}>Interested Destination</label>
                  <select value={enquiry.destination} onChange={e => setEnquiry(v => ({ ...v, destination: e.target.value }))} style={{ ...INPUT, cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '16px' }}>
                    <option value="">Select a destination...</option>
                    {destinations.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 6, display: 'block' }}>Your Message</label>
                  <textarea rows={4} value={enquiry.message} onChange={e => setEnquiry(v => ({ ...v, message: e.target.value }))} placeholder="Tell us about your trip (dates, guests, requests)..." style={{ ...INPUT, resize: 'vertical' }} />
                </div>
                
                {status === 'error' && <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>Something went wrong. Please try again.</p>}
                
                <button type="submit" disabled={status === 'sending'}
                  style={{ width: '100%', padding: '14px 0', borderRadius: 10, border: 'none', marginTop: 8,
                    background: status === 'sending' ? '#e5e7eb' : 'linear-gradient(135deg,#8A6E1C,#8A6E1C)',
                    color: status === 'sending' ? '#9ca3af' : '#fff', fontWeight: 700, fontSize: 15,
                    cursor: status === 'sending' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {status === 'sending'
                    ? <><span style={{ width: 16, height: 16, border: '2px solid #d1d5db', borderTop: '2px solid #9ca3af', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} /> Sending...</>
                    : <><Send size={16} /> Send Inquiry</>}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Contact details & Map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: '#fff', padding: 32, borderRadius: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 24, color: '#111', marginBottom: 24 }}>Contact Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <a href={`tel:+${phone}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FBF6E7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={20} style={{ color: '#8A6E1C' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#111', marginTop: 4 }}>+{phone || '91XXXXXXXXXX'}</div>
                  </div>
                </a>
                {email && (
                  <a href={`mailto:${email}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FBF6E7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Mail size={20} style={{ color: '#8A6E1C' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#111', marginTop: 4 }}>{email}</div>
                    </div>
                  </a>
                )}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FBF6E7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={20} style={{ color: '#8A6E1C' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Head Office</div>
                      <div style={{ fontSize: 15, color: '#4b5563', marginTop: 4, lineHeight: 1.5 }}>
                        TripHoga<br/>
                        239, Vivek vihar, Ranipur mor,<br/>
                        Haridwar-249401
                      </div>
                      <a href="https://maps.app.goo.gl/cQp5bUePhXKk3tin6?g_st=awb" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 700, color: '#8A6E1C', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, textDecoration: 'none' }}>
                        View on Map
                      </a>
                    </div>
                    
                    <div style={{ height: 1, background: '#f3f4f6', width: '100%' }} />
                    
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Branch Office</div>
                      <div style={{ fontSize: 15, color: '#4b5563', marginTop: 4, lineHeight: 1.5 }}>
                        Flat number 03, Aravalli apartments,<br/>
                        Iris global mahipalpur bypass, Delhi
                      </div>
                      <a href="https://maps.app.goo.gl/bCAXe6AwZZK3dsUK8?g_st=awb" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 700, color: '#8A6E1C', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, textDecoration: 'none' }}>
                        View on Map
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div style={{ flex: 1, borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', minHeight: 250, background: '#e5e7eb' }}>
              <iframe
                src="https://maps.google.com/maps?q=239,Vivek+vihar,+Ranipur+mor,+Haridwar-249401&t=&z=13&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
