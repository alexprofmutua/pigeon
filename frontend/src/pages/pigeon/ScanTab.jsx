import { useRef, useState } from 'react'
import { usePigeon } from '../../context/PigeonContext'
import { pgnToLocalGame } from '../../utils/chessMoves'

export default function ScanTab() {
  const { pendingImages, addPendingFiles, clearPending, processPendingImages, addReviewGame, showToast } =
    usePigeon()
  const fileRef = useRef(null)
  const cameraRef = useRef(null)
  const [pgnPaste, setPgnPaste] = useState('')

  const hasPending = pendingImages.some((p) => p.status === 'pending')
  const processing = pendingImages.some((p) => p.status === 'processing')

  function addPgn() {
    if (!pgnPaste.trim()) return
    const parsed = pgnToLocalGame(pgnPaste)
    if (!parsed) {
      showToast('Could not parse that PGN')
      return
    }
    addReviewGame(parsed)
    setPgnPaste('')
    showToast('PGN added to review queue')
  }

  return (
    <>
      <div className="pigeon-card" data-label="Bulk Scan">
        <p style={{ fontSize: 13, opacity: 0.75, marginBottom: 10 }}>
          Upload one or more scoresheet photos. Each is read by the vision OCR engine, then checked
          move-by-move for legality before you confirm anything.
        </p>
        <div
          className="pigeon-drop-zone"
          role="button"
          tabIndex={0}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3a3229" strokeWidth="1.5">
            <path d="M12 5v14M5 12l7-7 7 7" />
          </svg>
          <div className="mono" style={{ fontSize: 12 }}>
            Click to choose photos (multiple allowed)
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button type="button" className="ghost" style={{ flex: 1 }} onClick={() => cameraRef.current?.click()}>
            📷 Take photo
          </button>
          <button type="button" className="ghost" style={{ flex: 1 }} onClick={() => fileRef.current?.click()}>
            🖼 Choose from library
          </button>
        </div>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            addPendingFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          multiple
          hidden
          onChange={(e) => {
            addPendingFiles(e.target.files)
            e.target.value = ''
          }}
        />
        {pendingImages.length > 0 && (
          <div className="pigeon-thumb-row">
            {pendingImages.map((p) => {
              const label =
                p.status === 'ok'
                  ? 'clean'
                  : p.status === 'flagged'
                    ? 'needs review'
                    : p.status === 'failed'
                      ? 'failed'
                      : p.status === 'processing'
                        ? 'reading…'
                        : 'queued'
              const cls =
                p.status === 'ok' ? 'ok' : p.status === 'flagged' || p.status === 'failed' ? 'err' : 'pending'
              return (
                <div key={p.id} className="pigeon-thumb">
                  <img src={p.dataUrl} alt="" />
                  <div className={`status ${cls}`}>{label}</div>
                </div>
              )
            })}
          </div>
        )}
        {pendingImages.some((p) => p.status === 'failed') && (
          <div style={{ marginTop: 10, borderLeft: '3px solid var(--flag-red)', paddingLeft: 10 }}>
            {pendingImages
              .filter((p) => p.status === 'failed')
              .map((p) => (
                <div key={p.id} className="mono" style={{ fontSize: 11, color: 'var(--flag-red)', marginBottom: 4 }}>
                  Image failed: {p.errorMsg || 'unknown error'}
                </div>
              ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="primary" disabled={!hasPending || processing} onClick={processPendingImages}>
            {processing ? (
              <>
                <span className="pigeon-spinner" /> Reading scoresheets…
              </>
            ) : (
              'Extract games'
            )}
          </button>
          {pendingImages.length > 0 && (
            <button type="button" className="ghost" onClick={clearPending}>
              Clear queue
            </button>
          )}
        </div>
      </div>

      <div className="pigeon-card" data-label="Paste PGN">
        <textarea
          value={pgnPaste}
          onChange={(e) => setPgnPaste(e.target.value)}
          placeholder={'[Event "Mombasa Open 2024"]\n[White "..."]\n[Black "..."]\n1. e4 e5 2. Nf3 ...'}
        />
        <button type="button" className="primary" onClick={addPgn}>
          Add to review
        </button>
      </div>
    </>
  )
}
