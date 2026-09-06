'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import Link from 'next/link'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [demo, setDemo] = useState(false)
  const router = useRouter()

  // demo_mode is only ever reported while the site runs without a database.
  useEffect(() => {
    fetch('/api/settings')
      .then(r => (r.ok ? r.json() : {}))
      .then(s => setDemo(s.demo_mode === 'true'))
      .catch(() => {})
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (res.ok) {
        router.push('/admin/dashboard')
      } else {
        const { error: msg } = await res.json()
        setError(msg || 'Invalid username or password')
        setLoading(false)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: '#f9fafb' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ background: '#fff', borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>

          {/* Header */}
          <div style={{ padding: '32px 32px 24px', textAlign: 'center', background: 'linear-gradient(135deg,#16294D,#2F5490)' }}>
            <div style={{ padding: '8px 16px', borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.3)', margin: '0 auto 16px' , background:'#ffffff', width: 'fit-content'}}>
              <Image src="/logo.png" alt="Prashiv Holiday" width={96} height={96} style={{ objectFit: 'contain' }} />
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 22, color: '#fff', marginBottom: 4 }}>Prashiv Holiday</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Admin Panel</p>
          </div>

          {/* Demo mode notice */}
          {demo && (
            <div style={{ padding: '14px 32px', background: '#FBF6E7', borderBottom: '1px solid #EBD79A' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#8A6E1C', margin: '0 0 4px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Demo mode</p>
              <p style={{ fontSize: 13, color: '#6B5514', margin: 0, lineHeight: 1.5 }}>
                No database connected. Sign in with <strong>demo</strong> / <strong>demo</strong> to look around — nothing you change will be saved.
              </p>
              <button
                type="button"
                onClick={() => { setUsername('demo'); setPassword('demo') }}
                style={{ marginTop: 8, padding: '5px 12px', borderRadius: 8, border: '1px solid #EBD79A', background: '#fff', color: '#8A6E1C', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Fill demo login
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ padding: '28px 32px 32px' }}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Username</label>
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)} required
                placeholder="admin"
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 12,
                  border: '1.5px solid #e5e7eb', fontSize: 14, color: '#111',
                  background: '#f9fafb', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '11px 44px 11px 14px', borderRadius: 12,
                    border: '1.5px solid #e5e7eb', fontSize: 14, color: '#111',
                    background: '#f9fafb', outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button" onClick={() => setShow(!show)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}
                >
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(135deg,#16294D,#2F5490)', color: '#fff',
                fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? <><span style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.3)', borderTop: '2.5px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} /> Signing in...</>
                : <><LogIn size={16} /> Sign In</>
              }
            </button>
            <div style={{ textAlign: 'center', marginTop: 14 }}>
              <Link href="/admin/forgot-password" style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'none', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
