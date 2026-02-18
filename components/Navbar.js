import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'

const ADMIN_KEY = 'rk_admin_auth'

export default function Navbar({ onAdminChange }) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef()
  const dropdownRef = useRef()

  useEffect(() => {
    const stored = localStorage.getItem(ADMIN_KEY) === 'true'
    setIsAdmin(stored)
    onAdminChange?.(stored)
  }, [])

  useEffect(() => {
    if (showModal) {
      setPassword('')
      setError('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [showModal])

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    const correct = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'ranjan123'
    if (password === correct) {
      localStorage.setItem(ADMIN_KEY, 'true')
      setIsAdmin(true)
      setShowModal(false)
      onAdminChange?.(true)
    } else {
      setError('Wrong password. Try again.')
      setPassword('')
      inputRef.current?.focus()
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_KEY)
    setIsAdmin(false)
    setShowDropdown(false)
    onAdminChange?.(false)
  }

  return (
    <>
      <header style={{
        borderBottom: '1px solid rgba(201,150,59,0.3)',
        background: 'rgba(253,246,236,0.95)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 32px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="ornament">✦</span>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 900, color: 'var(--ink)', lineHeight: 1 }}>
                রঞ্জনের কীর্তি
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', letterSpacing: '0.15em', color: 'var(--muted)', textTransform: 'uppercase' }}>
                ranjan-er-kirti
              </div>
            </div>
          </Link>

          {/* Right nav */}
          <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <Link href="/" className={`nav-link ${router.pathname === '/' ? 'active' : ''}`}>Gallery</Link>
            <Link href="/upload" className={`nav-link ${router.pathname === '/upload' ? 'active' : ''}`}>Upload</Link>

            {/* Admin button */}
            {isAdmin ? (
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDropdown(p => !p)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'var(--ink)', color: 'var(--paper)',
                    border: 'none', padding: '6px 14px', borderRadius: '2px',
                    cursor: 'pointer', fontFamily: "'DM Mono', monospace",
                    fontSize: '11px', letterSpacing: '0.08em',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                  Admin ▾
                </button>
                {showDropdown && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    background: 'var(--paper)', border: '1px solid rgba(201,150,59,0.3)',
                    borderRadius: '2px', minWidth: '160px',
                    boxShadow: '0 8px 32px rgba(26,10,0,0.12)', zIndex: 200,
                  }}>
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(201,150,59,0.2)' }}>
                      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: 'var(--muted)' }}>Logged in as admin</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%', padding: '10px 16px', background: 'none',
                        border: 'none', textAlign: 'left', cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--rust)',
                      }}
                      onMouseEnter={e => e.target.style.background = 'rgba(185,74,44,0.06)'}
                      onMouseLeave={e => e.target.style.background = 'none'}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                style={{
                  background: 'none', border: '1px solid rgba(201,150,59,0.4)',
                  padding: '6px 14px', cursor: 'pointer',
                  fontFamily: "'DM Mono', monospace", fontSize: '11px',
                  letterSpacing: '0.08em', color: 'var(--muted)', borderRadius: '2px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--saffron)'; e.target.style.color = 'var(--ink)' }}
                onMouseLeave={e => { e.target.style.borderColor = 'rgba(201,150,59,0.4)'; e.target.style.color = 'var(--muted)' }}
              >
                Admin Login
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Login Modal */}
      {showModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(10,4,0,0.6)',
            backdropFilter: 'blur(4px)', zIndex: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
          }}
        >
          <div style={{
            background: 'var(--paper)', border: '1px solid rgba(201,150,59,0.3)',
            borderRadius: '4px', padding: '40px', width: '100%', maxWidth: '380px',
            boxShadow: '0 24px 80px rgba(26,10,0,0.25)',
            animation: 'fadeUp 0.25s ease forwards',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <span className="ornament" style={{ fontSize: '24px' }}>✦</span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 900, color: 'var(--ink)', marginTop: '8px' }}>
                Admin Login
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
                Enter your password to manage the gallery
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <label style={{
                display: 'block', fontFamily: "'DM Mono', monospace", fontSize: '10px',
                letterSpacing: '0.12em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px',
              }}>Password</label>
              <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="Enter admin password"
                style={{
                  width: '100%', padding: '12px 16px', background: 'transparent',
                  border: `1px solid ${error ? 'var(--rust)' : 'rgba(201,150,59,0.4)'}`,
                  borderRadius: '2px', fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px', color: 'var(--ink)', outline: 'none', letterSpacing: '0.1em',
                }}
              />
              {error && (
                <p style={{ color: 'var(--rust)', fontSize: '12px', marginTop: '6px', fontFamily: "'DM Mono', monospace" }}>
                  {error}
                </p>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Login</button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '12px 20px', background: 'none',
                    border: '1px solid rgba(201,150,59,0.3)', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--muted)', borderRadius: '2px',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
