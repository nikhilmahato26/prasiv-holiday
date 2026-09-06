'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Building2, Mail, Phone, Lock, Globe, FileText, ArrowLeft, Check, ShieldCheck } from 'lucide-react'

export default function AgencyRegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', description: '', website: '' })
  const [step, setStep] = useState('form')   // 'form' | 'otp' | 'done'
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const S = {
    page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #16294D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' },
    card: { background: '#fff', borderRadius: 24, width: '100%', maxWidth: 520, boxShadow: '0 25px 60px rgba(0,0,0,0.3)', overflow: 'hidden' },
    input: { width: '100%', padding: '11px 14px 11px 40px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, color: '#111', background: '#f9fafb', outline: 'none', boxSizing: 'border-box' },
    label: { fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6, display: 'block' },
    wrap: { position: 'relative' },
    icon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' },
  }

  const f = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  const startCooldown = () => {
    setResendCooldown(60)
    const t = setInterval(() => {
      setResendCooldown(prev => { if (prev <= 1) { clearInterval(t); return 0 } return prev - 1 })
    }, 1000)
  }

  const sendOtp = async () => {
    setError('')
    if (!form.email.trim()) { setError('Enter your email address first'); return }
    setSending(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to send OTP'); return }
      setStep('otp')
      startCooldown()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (!otp.trim()) { setError('Please enter the OTP sent to your email'); return }
    setLoading(true)
    try {
      // Verify OTP first
      const otpRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), otp: otp.trim() }),
      })
      const otpData = await otpRes.json()
      if (!otpRes.ok) { setError(otpData.error || 'Invalid OTP'); return }

      // Register agency
      const res = await fetch('/api/agencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password, description: form.description, website: form.website }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Registration failed'); return }
      setStep('done')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'done') {
    return (
      <div style={S.page}>
        <div style={{ ...S.card, padding: 48, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Check size={36} style={{ color: '#fff' }} />
          </div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 26, color: '#111', marginBottom: 10 }}>Application Submitted!</h2>
          <p style={{ color: '#6b7280', lineHeight: 1.7, marginBottom: 28, fontSize: 15 }}>
            Your agency registration is under review. Our admin team will get back to you soon. You&apos;ll receive an email once approved.
          </p>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 999, background: 'linear-gradient(135deg,#8A6E1C,#8A6E1C)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={S.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={S.card}>
        <div style={{ padding: '28px 32px', background: 'linear-gradient(135deg,#8A6E1C,#8A6E1C)' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 16 }}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={22} style={{ color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 22, color: '#fff', margin: 0 }}>Join as Agency</h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, margin: 0 }}>Partner with us to list your Kerala packages</p>
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6' }}>
          {[{ n: 1, label: 'Details' }, { n: 2, label: 'Verify Email' }].map(({ n, label }) => {
            const active = (n === 1 && step === 'form') || (n === 2 && step === 'otp')
            const done = (n === 1 && step === 'otp')
            return (
              <div key={n} style={{ flex: 1, padding: '10px 0', textAlign: 'center', borderBottom: active ? '2px solid #8A6E1C' : '2px solid transparent' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: done ? '#22c55e' : active ? '#8A6E1C' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: done || active ? '#fff' : '#9ca3af' }}>
                    {done ? <Check size={11} /> : n}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: active ? '#8A6E1C' : done ? '#22c55e' : '#9ca3af' }}>{label}</span>
                </div>
              </div>
            )
          })}
        </div>

        {error && (
          <div style={{ margin: '16px 32px 0', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        )}

        {/* Step 1: Form */}
        {step === 'form' && (
          <div style={{ padding: '24px 32px 28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={S.label}>Agency / Business Name *</label>
                <div style={S.wrap}>
                  <Building2 size={15} style={S.icon} />
                  <input required value={form.name} onChange={f('name')} style={S.input} placeholder="Kerala Holidays Pvt Ltd" />
                </div>
              </div>
              <div>
                <label style={S.label}>Email Address *</label>
                <div style={S.wrap}>
                  <Mail size={15} style={S.icon} />
                  <input required type="email" value={form.email} onChange={f('email')} style={S.input} placeholder="agency@email.com" />
                </div>
              </div>
              <div>
                <label style={S.label}>Phone Number *</label>
                <div style={S.wrap}>
                  <Phone size={15} style={S.icon} />
                  <input required value={form.phone} onChange={f('phone')} style={S.input} placeholder="9876543210" />
                </div>
              </div>
              <div>
                <label style={S.label}>Password *</label>
                <div style={S.wrap}>
                  <Lock size={15} style={S.icon} />
                  <input required type="password" value={form.password} onChange={f('password')} style={S.input} placeholder="Min. 8 characters" />
                </div>
              </div>
              <div>
                <label style={S.label}>Confirm Password *</label>
                <div style={S.wrap}>
                  <Lock size={15} style={S.icon} />
                  <input required type="password" value={form.confirm} onChange={f('confirm')} style={S.input} placeholder="Repeat password" />
                </div>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={S.label}>Website (optional)</label>
                <div style={S.wrap}>
                  <Globe size={15} style={S.icon} />
                  <input value={form.website} onChange={f('website')} style={S.input} placeholder="https://youragency.com" />
                </div>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={S.label}>Brief Description</label>
                <div style={{ position: 'relative' }}>
                  <FileText size={15} style={{ ...S.icon, top: 14, transform: 'none' }} />
                  <textarea value={form.description} onChange={f('description')} rows={3}
                    style={{ ...S.input, paddingTop: 11, resize: 'vertical', lineHeight: 1.6 }}
                    placeholder="Tell us about your agency — speciality, experience, regions covered..." />
                </div>
              </div>
            </div>

            <button type="button" onClick={sendOtp} disabled={sending || !form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password.trim() || form.password !== form.confirm || form.password.length < 8}
              style={{ width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', cursor: (sending || !form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password || form.password !== form.confirm || form.password.length < 8) ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#8A6E1C,#8A6E1C)', color: '#fff', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (sending || !form.name.trim() || !form.email.trim()) ? 0.7 : 1 }}>
              {sending
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} /> Sending OTP...</>
                : <><Mail size={16} /> Send Verification Code</>
              }
            </button>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#9ca3af' }}>
              Already approved?{' '}
              <Link href="/agency" style={{ color: '#8A6E1C', fontWeight: 600, textDecoration: 'none' }}>Sign in to your dashboard</Link>
            </p>
          </div>
        )}

        {/* Step 2: OTP */}
        {step === 'otp' && (
          <form onSubmit={submit} style={{ padding: '24px 32px 28px' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FBF6E7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <ShieldCheck size={26} style={{ color: '#8A6E1C' }} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 17, color: '#111', margin: '0 0 6px' }}>Check your inbox</h3>
              <p style={{ color: '#6b7280', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                We sent a 6-digit code to <strong>{form.email}</strong>.<br />It expires in 10 minutes.
              </p>
            </div>

            <label style={S.label}>Verification Code</label>
            <input
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={{ ...S.input, paddingLeft: 14, textAlign: 'center', fontSize: 28, fontWeight: 800, letterSpacing: 10, fontFamily: 'monospace', marginBottom: 20 }}
              placeholder="000000"
              maxLength={6}
              autoFocus
            />

            <button type="submit" disabled={loading || otp.length !== 6}
              style={{ width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', cursor: (loading || otp.length !== 6) ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#8A6E1C,#8A6E1C)', color: '#fff', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (loading || otp.length !== 6) ? 0.7 : 1, marginBottom: 14 }}>
              {loading
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} /> Verifying...</>
                : <><ShieldCheck size={16} /> Verify & Submit Application</>
              }
            </button>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
              <button type="button" onClick={() => { setStep('form'); setOtp(''); setError('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
                ← Edit details
              </button>
              <span style={{ color: '#e5e7eb' }}>·</span>
              <button type="button" onClick={() => { setError(''); sendOtp() }} disabled={resendCooldown > 0 || sending}
                style={{ background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', fontSize: 13, color: resendCooldown > 0 ? '#9ca3af' : '#8A6E1C', fontWeight: 600 }}>
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
