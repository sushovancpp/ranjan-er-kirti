import { useState, useRef, useCallback } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import Link from 'next/link'

export default function Upload() {
  const [files, setFiles] = useState([])
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const handleFiles = useCallback((incoming) => {
    const valid = Array.from(incoming).filter(f => f.type.startsWith('image/'))
    const previews = valid.map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
      name: f.name,
      size: (f.size / 1024 / 1024).toFixed(2)
    }))
    setFiles(prev => [...prev, ...previews])
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const removeFile = (idx) => {
    setFiles(prev => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)
    setProgress(0)
    setResults([])

    const uploaded = []
    for (let i = 0; i < files.length; i++) {
      const { file } = files[i]
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ranjan_kirti')
      if (caption) formData.append('context', `caption=${caption}`)

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'myname'}/image/upload`,
          { method: 'POST', body: formData }
        )
        const data = await res.json()
        if (data.secure_url) {
          // Save to our DB
          await fetch('/api/images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: data.secure_url,
              public_id: data.public_id,
              caption: caption || '',
              created_at: data.created_at,
              width: data.width,
              height: data.height,
            })
          })
          uploaded.push({ success: true, url: data.secure_url, name: file.name })
        } else {
          uploaded.push({ success: false, name: file.name, error: data.error?.message || 'Upload failed' })
        }
      } catch (err) {
        uploaded.push({ success: false, name: file.name, error: err.message })
      }

      setProgress(Math.round(((i + 1) / files.length) * 100))
    }

    setResults(uploaded)
    setUploading(false)
    setFiles([])
    setCaption('')
  }

  return (
    <>
      <Head>
        <title>Upload — রঞ্জনের কীর্তি</title>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✦</text></svg>" />
      </Head>

      <Navbar />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 32px 80px' }}>
        
        {/* Header */}
        <div className="fade-up">
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', letterSpacing: '0.2em', color: 'var(--saffron)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Contribute to the mosaic
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, color: 'var(--ink)', marginBottom: '12px' }}>
            Upload <em style={{ color: 'var(--saffron)' }}>Images</em>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.6 }}>
            Your photos will appear in the public gallery immediately after upload. No account required.
          </p>
        </div>

        <div className="divider fade-up fade-up-delay-1" style={{ margin: '32px 0' }}>
          <span className="ornament" style={{ fontSize: '12px' }}>✦</span>
        </div>

        {/* Drop zone */}
        <div
          className={`upload-zone fade-up fade-up-delay-2 ${dragging ? 'dragging' : ''}`}
          style={{ borderRadius: '4px', padding: '48px 32px', textAlign: 'center', cursor: 'pointer' }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📷</div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--ink)', marginBottom: '8px' }}>
            Drop images here
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
            or click to browse · JPG, PNG, GIF, WebP accepted
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* Previews */}
        {files.length > 0 && (
          <div className="fade-up" style={{ marginTop: '24px' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
              {files.map((f, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '2px', overflow: 'hidden', background: 'var(--cream)' }}>
                  <img src={f.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                    style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', background: 'rgba(26,10,0,0.8)', color: 'var(--paper)', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: '12px', lineHeight: '20px', textAlign: 'center' }}
                  >
                    ×
                  </button>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(26,10,0,0.7)', padding: '3px 6px' }}>
                    <p style={{ color: 'var(--cream)', fontSize: '9px', fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {f.size}MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Caption field */}
        <div style={{ marginTop: '24px' }}>
          <label style={{ display: 'block', fontFamily: "'DM Mono', monospace", fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Caption <span style={{ color: 'var(--gold)' }}>(optional)</span>
          </label>
          <input
            type="text"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Add a caption to your images..."
            maxLength={120}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'transparent',
              border: '1px solid rgba(201,150,59,0.4)',
              borderRadius: '2px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              color: 'var(--ink)',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--saffron)'}
            onBlur={e => e.target.style.borderColor = 'rgba(201,150,59,0.4)'}
          />
          <div style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>
            {caption.length}/120
          </div>
        </div>

        {/* Progress */}
        {uploading && (
          <div style={{ marginTop: '20px' }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: 'var(--muted)', marginTop: '8px', textAlign: 'center' }}>
              uploading... {progress}%
            </p>
          </div>
        )}

        {/* Upload button */}
        <div style={{ marginTop: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button
            className="btn-primary"
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            {uploading ? <><span className="spinner"></span> Uploading...</> : `Upload ${files.length > 0 ? files.length + ' Image' + (files.length > 1 ? 's' : '') : 'Images'}`}
          </button>
          {files.length > 0 && !uploading && (
            <button
              onClick={() => setFiles([])}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear all
            </button>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ marginTop: '32px', borderTop: '1px solid rgba(201,150,59,0.2)', paddingTop: '24px' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '16px' }}>
              Upload Results
            </div>
            {results.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid rgba(201,150,59,0.1)' }}>
                <span style={{ fontSize: '16px' }}>{r.success ? '✓' : '✗'}</span>
                <span style={{ fontSize: '13px', color: r.success ? 'var(--ink)' : 'var(--rust)', flex: 1 }}>
                  {r.name}
                </span>
                {r.success && (
                  <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: 'var(--saffron)', textDecoration: 'none' }}>
                    view ↗
                  </a>
                )}
                {!r.success && (
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: 'var(--rust)' }}>
                    {r.error}
                  </span>
                )}
              </div>
            ))}

            {results.some(r => r.success) && (
              <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                <Link href="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                  View Gallery
                </Link>
                <button
                  onClick={() => { setResults([]); setProgress(0) }}
                  style={{ background: 'none', border: '1px solid rgba(201,150,59,0.4)', padding: '12px 24px', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink)' }}
                >
                  Upload More
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(201,150,59,0.2)', padding: '24px 32px', textAlign: 'center' }}>
        <span className="ornament" style={{ fontSize: '14px' }}>✦</span>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: 'var(--muted)', marginTop: '8px', letterSpacing: '0.08em' }}>
          ranjan-er-kirti · all images are stored permanently on cloudinary
        </p>
      </footer>
    </>
  )
}
