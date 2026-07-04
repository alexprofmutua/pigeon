import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import UploadZone from '../components/UploadZone'
import { checkScoresheetPhoto, formatPhotoIssues } from '../utils/photoCheck'

export default function UploadPage() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [eventId, setEventId] = useState('')
  const [preview, setPreview] = useState(null)
  const [photoIssues, setPhotoIssues] = useState([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.listEvents().then(setEvents).catch(() => {})
  }, [])

  async function uploadFile(file) {
    setBusy(true)
    setStatus('Uploading scoresheet…')

    try {
      const upload = await api.upload(file, eventId || undefined)
      setStatus('Running smart OCR… this may take 30–45 seconds')
      const processed = await api.processUpload(upload.id)
      if (processed.status === 'failed') {
        throw new Error(processed.error_message || 'OCR failed')
      }
      const provider = processed.ocr_provider || 'unknown'
      setStatus(`OCR complete (${provider}) — opening review…`)
      navigate(`/games/${processed.game_id}/review`, {
        state: { eventId: eventId || undefined },
      })
    } catch (err) {
      setError(err.message)
      setStatus('')
    } finally {
      setBusy(false)
    }
  }

  async function handleFile(file) {
    setError('')
    setPhotoIssues([])
    setPreview(URL.createObjectURL(file))

    let proceed = true
    try {
      const { ok, issues } = await checkScoresheetPhoto(file)
      if (!ok) {
        setPhotoIssues(issues)
        proceed = window.confirm(
          `This photo may not scan well:\n\n${formatPhotoIssues(issues)}\n\nUpload anyway?`
        )
      }
    } catch {
      /* skip check if browser cannot analyze */
    }

    if (!proceed) {
      setStatus('')
      return
    }

    await uploadFile(file)
  }

  return (
    <div className="upload-page">
      <header className="page-header centered">
        <h1>Scan a scoresheet</h1>
        <p className="subtitle">Frame the entire sheet — header at top, move grid below.</p>
      </header>

      {error && <div className="alert error">{error}</div>}
      {status && <div className="alert info">{status}</div>}
      {photoIssues.length > 0 && !busy && (
        <div className="alert warn photo-warn">
          <strong>Photo tip:</strong>
          <ul>
            {photoIssues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="upload-layout">
        <UploadZone onFile={handleFile} disabled={busy} />

        <div className="upload-tips card">
          <h2>How to photograph</h2>
          <ol>
            <li><strong>Fill the frame</strong> — the whole scoresheet, not the table around it</li>
            <li><strong>Portrait orientation</strong> — hold phone upright above the sheet</li>
            <li><strong>Include everything</strong> — event header + all move columns</li>
            <li><strong>Flat and lit</strong> — avoid shadows and blur</li>
          </ol>
        </div>

        <div className="upload-options card">
          <label>
            Event (optional)
            <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
              <option value="">— Select later —</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>{evt.name}</option>
              ))}
            </select>
          </label>
          {preview && (
            <div className="preview-wrap">
              <p className="label">Preview</p>
              <img src={preview} alt="Scoresheet preview" className="scoresheet-preview" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
