import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import ChessBoard from '../../components/ChessBoard'
import { pgnToReplay } from '../../utils/pgnReplay'
import { downloadText } from '../../utils/chessMoves'

export default function ReplayPanel({ gameId, white, black, onClose }) {
  const [replay, setReplay] = useState(null)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    setReplay(null)
    setStep(0)
    api
      .exportPgn(gameId)
      .then((pgn) => setReplay(pgnToReplay(pgn)))
      .catch((err) => setError(err.message))
  }, [gameId])

  if (error) {
    return (
      <div className="pigeon-card" data-label="Replay">
        <p style={{ color: 'var(--flag-red)', fontSize: 12 }}>{error}</p>
        <button type="button" className="ghost" onClick={onClose}>
          ← Back
        </button>
      </div>
    )
  }

  if (!replay) {
    return (
      <div className="pigeon-card" data-label="Replay">
        <span className="pigeon-spinner" /> <span className="mono" style={{ fontSize: 12 }}>Loading game…</span>
      </div>
    )
  }

  const fen = replay.fenPositions[step] || replay.fenPositions[0]
  const totalPlies = replay.moves.length
  const title = `${replay.white} vs ${replay.black}`

  return (
    <>
      <button type="button" className="ghost" style={{ marginBottom: 14 }} onClick={onClose}>
        ← Back to archive
      </button>
      <div className="pigeon-card" data-label="Replay">
        <div className="display" style={{ fontSize: 18, marginBottom: 4 }}>
          {title}
        </div>
        <div className="mono" style={{ fontSize: 11, opacity: 0.7, marginBottom: 14 }}>
          {[replay.event, replay.result].filter(Boolean).join(' · ')}
        </div>
        <div className="pigeon-replay-layout">
          <ChessBoard fen={fen} />
          <div>
            <div className="mono" style={{ fontSize: 12, marginBottom: 10 }}>
              Move {Math.ceil(step / 2) || 0} · ply {step} of {totalPlies}
            </div>
            <div className="pigeon-replay-controls">
              <button type="button" className="ghost" disabled={step === 0} onClick={() => setStep(0)}>
                ⏮ Start
              </button>
              <button type="button" className="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
                ◀ Back
              </button>
              <button
                type="button"
                className="ghost"
                disabled={step >= totalPlies}
                onClick={() => setStep((s) => s + 1)}
              >
                Forward ▶
              </button>
              <button type="button" className="ghost" disabled={step >= totalPlies} onClick={() => setStep(totalPlies)}>
                End ⏭
              </button>
            </div>
            <div className="pigeon-move-notation">
              {replay.moves.map((san, idx) => (
                <button
                  key={san + idx}
                  type="button"
                  className={step === idx + 1 ? 'active' : ''}
                  onClick={() => setStep(idx + 1)}
                >
                  {san}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="primary"
              style={{ marginTop: 14 }}
              onClick={async () => {
                const pgn = await api.exportPgn(gameId)
                downloadText(`${white || replay.white}_vs_${black || replay.black}.pgn`, pgn)
              }}
            >
              Download PGN
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
