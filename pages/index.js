import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import Link from 'next/link'

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)
  const [error, setError] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/images')
      if (!res.ok) throw new Error('Failed to fetch images')
      const data = await res.json()
      setImages(data.images || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchImages() }, [fetchImages])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') { setLightbox(null); setConfirmDelete(null) }
      if (e.key === 'ArrowRight' && lightbox !== null) setLightbox(prev => (prev + 1) % images.length)
      if (e.key === 'ArrowLeft' && lightbox !== null) setLightbox(prev => (prev - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightbox, images.length])

  const handleDelete = async (img) => {
    setDeleting(img.public_id)
    setConfirmDelete(null)
    try {
      const res = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: img.public_id }),
      })
      const data = await res.json()
      if (data.success) {
        setImages(prev => prev.filter(i => i.public_id !== img.public_id))
        if (lightbox !== null) setLightbox(null)
      } else {
        alert('Delete failed: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      alert('Delete error: ' + err.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <>
      <Head>
        <title>Gallery — রঞ্জনের কীর্তি</title>
        <meta name="description" content="A public mosaic gallery — ranjan-er-kirti" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✦</text></svg>" />
      </Head>

      <Navbar onAdminChange={setIsAdmin} />

      {isAdmin && (
        <div style={{
          background: 'var(--ink)', color: 'var(--paper)', padding: '8px 32px',
          textAlign: 'center', fontFamily: "'DM Mono', monospace", fontSize: '11px',
          letterSpacing: '0.1em', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '12px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
          Admin mode active — hover any image to delete it
        </div>
      )}

      <main>
        <section style={{ padding: '48px 32px 32px', maxWidth: '1400px', margin: '0 auto' }}>
          <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', letterSpacing: '0.2em', color: 'var(--saffron)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Public Mosaic Gallery
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, lineHeight: 1.05, color: 'var(--ink)' }}>
                রঞ্জনের<br /><em style={{ color: 'var(--saffron)' }}>কীর্তি</em>
              </h1>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '32px', color: 'var(--muted)' }}>
                {loading ? '—' : images.length.toString().padStart(3, '0')}
              </div>
              <div style={{ fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase' }}>images uploaded</div>
              <Link href="/upload" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', fontSize: '11px' }}>+ Add Photo</Link>
            </div>
          </div>
          <div className="divider fade-up fade-up-delay-1" style={{ margin: '32px 0 24px' }}>
            <span className="ornament" style={{ fontSize: '12px' }}>✦</span>
          </div>
        </section>

        <section style={{ padding: '0 22px 60px', maxWidth: '1400px', margin: '0 auto' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px', gap: '16px' }}>
              <div className="spinner" style={{ width: '40px', height: '40px' }} />
              <p style={{ color: 'var(--muted)', fontFamily: "'DM Mono', monospace", fontSize: '12px', letterSpacing: '0.1em' }}>loading gallery...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--rust)' }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px' }}>Could not load gallery</p>
              <p style={{ fontSize: '13px', marginTop: '8px', color: 'var(--muted)' }}>{error}</p>
              <button onClick={fetchImages} className="btn-primary" style={{ marginTop: '24px' }}>Retry</button>
            </div>
          ) : images.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 40px' }}>
              <div className="ornament" style={{ fontSize: '48px', marginBottom: '16px' }}>✦</div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: 'var(--ink)', marginBottom: '8px' }}>The gallery awaits its first image</p>
              <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '32px' }}>Be the first to contribute to this mosaic.</p>
              <Link href="/upload" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Upload First Image</Link>
            </div>
          ) : (
            <div className="mosaic-grid">
              {images.map((img, i) => (
                <div
                  key={img.public_id || i}
                  className={`mosaic-item fade-up ${isAdmin ? 'admin-mode' : ''}`}
                  style={{ animationDelay: `${Math.min(i * 0.05, 0.5)}s`, opacity: 0 }}
                  onClick={() => !isAdmin && setLightbox(i)}
                >
                  <img src={img.url} alt={img.caption || `Image ${i + 1}`} loading="lazy" />

                  {!isAdmin && (
                    <div className="overlay">
                      <span style={{ color: 'rgba(253,246,236,0.85)', fontFamily: "'DM Mono', monospace", fontSize: '10px' }}>
                        {img.caption || formatDate(img.created_at)}
                      </span>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="admin-overlay">
                      <button
                        className="delete-btn"
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(img) }}
                        disabled={deleting === img.public_id}
                      >
                        {deleting === img.public_id
                          ? <><span className="spinner" style={{ width: '12px', height: '12px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Deleting...</>
                          : <>🗑 Delete</>
                        }
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Lightbox */}
      {lightbox !== null && images[lightbox] && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button onClick={(e) => { e.stopPropagation(); setLightbox(prev => (prev - 1 + images.length) % images.length) }}
            style={{ position: 'absolute', left: '24px', background: 'none', border: '1px solid rgba(201,150,59,0.4)', color: 'var(--paper)', padding: '12px 16px', cursor: 'pointer', fontSize: '18px', top: '50%', transform: 'translateY(-50%)' }}>‹</button>
          <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <img src={images[lightbox].url} alt="" />
            {images[lightbox].caption && <p style={{ color: 'var(--cream)', fontSize: '14px' }}>{images[lightbox].caption}</p>}
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: 'var(--muted)' }}>
              {lightbox + 1} / {images.length} · ESC or click outside to close
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setLightbox(prev => (prev + 1) % images.length) }}
            style={{ position: 'absolute', right: '24px', background: 'none', border: '1px solid rgba(201,150,59,0.4)', color: 'var(--paper)', padding: '12px 16px', cursor: 'pointer', fontSize: '18px', top: '50%', transform: 'translateY(-50%)' }}>›</button>
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div onClick={() => setConfirmDelete(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(10,4,0,0.7)',
          backdropFilter: 'blur(4px)', zIndex: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--paper)', border: '1px solid rgba(185,74,44,0.4)',
            borderRadius: '4px', padding: '32px', maxWidth: '360px', width: '100%',
            boxShadow: '0 24px 80px rgba(26,10,0,0.3)',
            animation: 'fadeUp 0.2s ease forwards',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🗑</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--ink)' }}>Delete this image?</h3>
              <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '6px', lineHeight: 1.5 }}>
                This will permanently remove the image from Cloudinary. Cannot be undone.
              </p>
            </div>
            <div style={{ borderRadius: '2px', overflow: 'hidden', marginBottom: '20px' }}>
              <img src={confirmDelete.url} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleDelete(confirmDelete)}
                style={{
                  flex: 1, padding: '12px', background: 'var(--rust)', color: 'white',
                  border: 'none', borderRadius: '2px', cursor: 'pointer',
                  fontFamily: "'DM Mono', monospace", fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase',
                }}
              >Yes, Delete</button>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  flex: 1, padding: '12px', background: 'none',
                  border: '1px solid rgba(201,150,59,0.3)', borderRadius: '2px', cursor: 'pointer',
                  fontFamily: "'DM Mono', monospace", fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase',
                }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      <footer style={{ borderTop: '1px solid rgba(201,150,59,0.2)', padding: '24px 32px', textAlign: 'center' }}>
        <span className="ornament" style={{ fontSize: '14px' }}>✦</span>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: 'var(--muted)', marginTop: '8px', letterSpacing: '0.08em' }}>
          ranjan-er-kirti · a public mosaic · forever growing
        </p>
      </footer>
    </>
  )
}

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}