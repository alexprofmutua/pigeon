import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import ChessBoard from '../components/ChessBoard'

export default function ReplayPage() {
  const { gameId } = useParams()
  const [replay, setReplay] = useState(null)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .getReplay(gameId)
      .then(setReplay)
      .catch((err) => setError(err.message))
  }, [gameId])

  async function downloadPgn() {
    try {
      const pgn = await api.exportPgn(gameId)
      const blob = new Blob([pgn], { type: 'application/x-chess-pgn' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pigeon-game-${gameId.slice(0, 8)}.pgn`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message)
    }
  }

  if (error) return <div className="alert error">{error}</div>
  if (!replay) return <div className="loading">Loading game…</div>

  const fen = replay.fen_positions[step] || replay.fen_positions[0]
  const totalPlies = replay.moves.length

  return (
    <div className="replay-page">
      <Link to="/library" className="back-link">← Back to library</Link>

      <header className="page-header">
        <div>
          <h1>{replay.white} vs {replay.black}</h1>
          <p className="subtitle">
            {[replay.event, replay.result].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="header-actions">
          <Link to={`/games/${gameId}/review`} className="btn-secondary">Edit moves</Link>
          <button type="button" className="btn-secondary" onClick={downloadPgn}>Export PGN</button>
        </div>
      </header>

      <div className="replay-layout">
        <ChessBoard fen={fen} />

        <div className="replay-controls card">
          <div className="step-info">
            Move {Math.ceil(step / 2) || 0} · ply {step} of {totalPlies}
          </div>
          <div className="step-buttons">
            <button type="button" className="btn-secondary" onClick={() => setStep(0)} disabled={step === 0}>
              ⏮ Start
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              ◀ Back
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep((s) => Math.min(totalPlies, s + 1))}
              disabled={step >= totalPlies}
            >
              Forward ▶
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep(totalPlies)}
              disabled={step >= totalPlies}
            >
              End ⏭
            </button>
          </div>

          <ol className="move-notation">
            {replay.moves.map((san, idx) => (
              <li
                key={idx}
                className={step === idx + 1 ? 'active' : ''}
                onClick={() => setStep(idx + 1)}
                onKeyDown={(e) => e.key === 'Enter' && setStep(idx + 1)}
                role="button"
                tabIndex={0}
              >
                {san}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
