'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Lock, Check, KeyRound, Eye, EyeOff } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('email')   // 'email' | 'reset' | 'done'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const S = {
    page: { minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a 0%,#16294D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' },
    card: { background: '#fff', borderRadius: 24, width: '100%', maxWidth: 420, boxShadow: '0 25px 60px rgba(0,0,0,0.3)', overflow: 'hidden' },
    input: { width: '100%', padding: '11px 14px 11px 40px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, color: '#111', background: '#f9fafb', outline: 'none', boxSizing: 'border-box' },
    label: { fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6, display: 'block' },
    icon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' },
  }

  const startCooldown = () => {
    setResendCooldown(60)
    const t = setInterval(() => {
      setResendCooldown(prev => { if (prev <= 1) { clearInterval(t); return 0 } return prev - 1 })
    }, 1000)
  }

  const sendOtp = async () => {
    setError('')
    if (!email.trim()) { setError('Enter your email address'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to send OTP'); return }
      setStep('reset')
      startCooldown()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (otp.length !== 6) { setError('Enter the 6-digit code sent to your email'); return }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return }
    if (newPassword !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/agency-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim(), newPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Reset failed'); return }
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
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 24, color: '#111', marginBottom: 10 }}>Password Reset!</h2>
          <p style={{ color: '#6b7280', lineHeight: 1.7, marginBottom: 28, fontSize: 15 }}>
            Your password has been updated successfully. You can now sign in with your new password.
          </p>
          <Link href="/agency" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 999, background: 'linear-gradient(135deg,#16294D,#0f172a)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={S.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={S.card}>
        {/* Header */}
        <div style={{ padding: '28px 32px', background: 'linear-gradient(135deg,#16294D,#0f172a)' }}>
          <Link href="/agency" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 16 }}>
            <ArrowLeft size={14} /> Back to Login
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <KeyRound size={22} style={{ color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 22, color: '#fff', margin: 0 }}>Forgot Password</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: 0 }}>Reset via email verification</p>
            </div>
          </div>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6' }}>
          {[{ n: 1, label: 'Verify Email' }, { n: 2, label: 'New Password' }].map(({ n, label }) => {
            const active = (n === 1 && step === 'email') || (n === 2 && step === 'reset')
            const done = n === 1 && step === 'reset'
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

        {/* Step 1: Email */}
        {step === 'email' && (
          <div style={{ padding: '24px 32px 28px' }}>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20, lineHeight: 1.6 }}>
              Enter the email address linked to your agency account. We&apos;ll send a 6-digit verification code.
            </p>
            <label style={S.label}>Email Address</label>
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <Mail size={15} style={S.icon} />
              <input
                type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendOtp()}
                style={S.input} placeholder="agency@email.com" autoFocus
              />
            </div>
            <button onClick={sendOtp} disabled={loading || !email.trim()}
              style={{ width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', cursor: (loading || !email.trim()) ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#16294D,#0f172a)', color: '#fff', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (loading || !email.trim()) ? 0.65 : 1 }}>
              {loading
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} /> Sending...</>
                : <><Mail size={16} /> Send Verification Code</>
              }
            </button>
          </div>
        )}

        {/* Step 2: OTP + New Password */}
        {step === 'reset' && (
          <form onSubmit={resetPassword} style={{ padding: '24px 32px 28px' }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#15803d', fontWeight: 500 }}>
              Code sent to <strong>{email}</strong> — check your inbox.
            </div>

            {/* OTP */}
            <div style={{ marginBottom: 18 }}>
              <label style={S.label}>6-Digit Verification Code</label>
              <input
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{ ...S.input, paddingLeft: 14, textAlign: 'center', fontSize: 26, fontWeight: 800, letterSpacing: 8, fontFamily: 'monospace' }}
                placeholder="000000" maxLength={6} autoFocus
              />
            </div>

            {/* New password */}
            <div style={{ marginBottom: 14 }}>
              <label style={S.label}>New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={S.icon} />
                <input
                  required type={showPw ? 'text' : 'password'}
                  value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  style={{ ...S.input, paddingRight: 40 }} placeholder="Min. 8 characters"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div style={{ marginBottom: 20 }}>
              <label style={S.label}>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={S.icon} />
                <input
                  required type="password"
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  style={{ ...S.input, borderColor: confirm && confirm !== newPassword ? '#fca5a5' : undefined }}
                  placeholder="Repeat new password"
                />
              </div>
              {confirm && confirm !== newPassword && (
                <p style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>Passwords do not match</p>
              )}
            </div>

            <button type="submit" disabled={loading || otp.length !== 6 || !newPassword || newPassword !== confirm}
              style={{ width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', cursor: (loading || otp.length !== 6 || !newPassword || newPassword !== confirm) ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#16294D,#0f172a)', color: '#fff', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (loading || otp.length !== 6 || !newPassword || newPassword !== confirm) ? 0.65 : 1, marginBottom: 14 }}>
              {loading
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} /> Resetting...</>
                : <><KeyRound size={16} /> Reset Password</>
              }
            </button>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
              <button type="button" onClick={() => { setStep('email'); setOtp(''); setError('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
                ← Change email
              </button>
              <span style={{ color: '#e5e7eb' }}>·</span>
              <button type="button" onClick={() => { setError(''); setOtp(''); sendOtp() }} disabled={resendCooldown > 0 || loading}
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
