import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { usePigeon } from '../../context/PigeonContext'

export default function ProfileTab() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { profile, saveProfile, backendOnline, checkBackend } = usePigeon()
  const [draft, setDraft] = useState(profile)

  const statusColor =
    backendOnline === true ? 'var(--board-green)' : backendOnline === false ? 'var(--flag-red)' : 'var(--brass)'
  const statusText =
    backendOnline === true ? 'online' : backendOnline === false ? 'unreachable' : 'checking…'

  function updateField(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <>
      <div className="pigeon-card" data-label="Backend Connection">
        <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 10 }}>
          Connected to the Pigeon FastAPI backend via Vite proxy. OCR, validation, and archive sync run
          server-side.
        </p>
        <div className="pigeon-field-row">
          <div>
            <label>API</label>
            <input type="text" value="/api/v1 (proxied → localhost:8000)" readOnly />
          </div>
          <div>
            <label>Status</label>
            <div className="mono" style={{ padding: '8px 0', color: statusColor }}>
              ● {statusText}
            </div>
          </div>
        </div>
        <button type="button" className="primary" onClick={checkBackend}>
          Check connection
        </button>
      </div>

      <div className="pigeon-card" data-label="Account">
        <div className="pigeon-field-row">
          <div>
            <label>Signed in as</label>
            <input type="text" value={user?.email || ''} readOnly />
          </div>
          <div>
            <label>Display name</label>
            <input type="text" value={user?.name || ''} readOnly />
          </div>
        </div>
        <button
          type="button"
          className="ghost"
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          Sign out
        </button>
      </div>

      <div className="pigeon-card" data-label="Player Profile">
        <div className="pigeon-field-row">
          <div>
            <label>Name (exactly as written on your scoresheets)</label>
            <input type="text" value={draft.name} onChange={(e) => updateField('name', e.target.value)} />
          </div>
          <div>
            <label>FIDE ID</label>
            <input type="text" value={draft.fide_id} onChange={(e) => updateField('fide_id', e.target.value)} />
          </div>
        </div>
        <div className="pigeon-field-row">
          <div>
            <label>FIDE Rating</label>
            <input type="text" value={draft.fide_rating} onChange={(e) => updateField('fide_rating', e.target.value)} />
          </div>
          <div />
        </div>
        <div className="pigeon-field-row">
          <div>
            <label>Chess.com Username</label>
            <input type="text" value={draft.chesscom} onChange={(e) => updateField('chesscom', e.target.value)} />
          </div>
          <div>
            <label>Chess.com Rating</label>
            <input
              type="text"
              value={draft.chesscom_rating}
              onChange={(e) => updateField('chesscom_rating', e.target.value)}
            />
          </div>
        </div>
        <div className="pigeon-field-row">
          <div>
            <label>Lichess Username</label>
            <input type="text" value={draft.lichess} onChange={(e) => updateField('lichess', e.target.value)} />
          </div>
          <div>
            <label>Lichess Rating</label>
            <input
              type="text"
              value={draft.lichess_rating}
              onChange={(e) => updateField('lichess_rating', e.target.value)}
            />
          </div>
        </div>
        <button type="button" className="primary" onClick={() => saveProfile(draft)}>
          Save profile
        </button>
        <p style={{ fontSize: 11, opacity: 0.6, marginTop: 14 }}>
          This name is matched against White/Black on every archived game to compute your dashboard — keep it
          consistent.
        </p>
      </div>
    </>
  )
}
