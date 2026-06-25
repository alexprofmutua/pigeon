import { useCallback, useRef, useState } from 'react'
import { checkHealth, processUpload, uploadScoresheet } from '../api'

export default function UploadView({ onUploaded }) {
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [backendOk, setBackendOk] = useState(null)

  const verifyBackend = useCallback(async () => {
    try {
      await checkHealth()
      setBackendOk(true)
    } catch {
      setBackendOk(false)
    }
  }, [])

  const handleFile = async (file) => {
    if (!file) return
    setError('')
    setStatus('uploading')

    try {
      await verifyBackend()
      const upload = await uploadScoresheet(file)
      setStatus('processing')
      const processed = await processUpload(upload.id)
      onUploaded({ upload: processed, previewUrl: URL.createObjectURL(file) })
    } catch (err) {
      setError(err.message || 'Upload failed')
      setStatus('idle')
    }
  }

  const onDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <section className="upload-view">
      <header className="page-header">
        <h1>Scan a scoresheet</h1>
        <p>Upload or photograph your scoresheet. We will extract moves for you to review.</p>
        {backendOk === false && (
          <p className="banner banner-error">
            Backend offline — start it with <code>uvicorn app.main:app --reload</code> in{' '}
            <code>backend/</code>
          </p>
        )}
        {backendOk === true && <p className="banner banner-ok">Backend connected</p>}
      </header>

      <div
        className={`dropzone ${dragging ? 'dropzone-active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <p className="dropzone-title">Drag & drop your scoresheet</p>
        <p className="dropzone-hint">JPEG, PNG, or WebP</p>
        <div className="dropzone-actions">
          <button type="button" onClick={() => fileInputRef.current?.click()}>
            Choose file
          </button>
          <button type="button" className="secondary" onClick={() => cameraInputRef.current?.click()}>
            Take photo
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {status === 'uploading' && <p className="status">Uploading…</p>}
      {status === 'processing' && <p className="status">Running OCR…</p>}
      {error && <p className="error">{error}</p>}
    </section>
  )
}
