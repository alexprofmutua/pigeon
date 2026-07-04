import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { api, getToken } from '../api/client'
import CopilotPanel from '../components/CopilotPanel'
import ScoresheetGrid, { gridToCorrections, pairsToGrid } from '../components/ScoresheetGrid'

const RESULTS = ['1-0', '0-1', '1/2-1/2', '*']

function correctionsToGrid(moves) {
  const pairs = []
  const byNum = new Map()
  for (const m of moves) {
    const moveNumber = Math.ceil(m.ply / 2)
    if (!byNum.has(moveNumber)) {
      byNum.set(moveNumber, { move_number: moveNumber, white: {}, black: {} })
    }
    const pair = byNum.get(moveNumber)
    const cell = { san: m.san, confidence: 1, valid: true, alternatives: [] }
    if (m.ply % 2 === 1) pair.white = cell
    else pair.black = cell
  }
  for (const n of [...byNum.keys()].sort((a, b) => a - b)) {
    const p = byNum.get(n)
    pairs.push({
      move_number: n,
      white: p.white,
      black: p.black,
    })
  }
  return pairsToGrid(pairs)
}

function applyReviewToForm(review, setters) {
  setters.setGridRows(pairsToGrid(review.moves))
  setters.setWhiteName(review.header.white?.value || '')
  setters.setBlackName(review.header.black?.value || '')
  setters.setEventName(review.header.event?.value || '')
  setters.setRound(review.header.round?.value || '')
  setters.setBoard(review.header.board?.value || '')
  setters.setSection(review.header.section?.value || '')
  setters.setDate(review.header.date?.value || '')
  setters.setResult(review.header.result?.value || '*')
}

export default function ReviewPage() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [review, setReview] = useState(null)
  const [gridRows, setGridRows] = useState(() => pairsToGrid([]))
  const [whiteName, setWhiteName] = useState('')
  const [blackName, setBlackName] = useState('')
  const [eventName, setEventName] = useState('')
  const [round, setRound] = useState('')
  const [board, setBoard] = useState('')
  const [section, setSection] = useState('')
  const [date, setDate] = useState('')
  const [result, setResult] = useState('*')
  const [eventId, setEventId] = useState(location.state?.eventId || '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)

  useEffect(() => {
    api
      .getReview(gameId)
      .then((data) => {
        setReview(data)
        applyReviewToForm(data, {
          setGridRows,
          setWhiteName,
          setBlackName,
          setEventName,
          setRound,
          setBoard,
          setSection,
          setDate,
          setResult,
        })
      })
      .catch((err) => setError(err.message))
  }, [gameId])

  function handleCopilotApply({ header, moves }) {
    if (header.event) setEventName(header.event)
    if (header.white) setWhiteName(header.white)
    if (header.black) setBlackName(header.black)
    if (header.round) setRound(String(header.round))
    if (header.board) setBoard(String(header.board))
    if (header.section) setSection(header.section)
    if (header.date) setDate(header.date)
    if (header.result) setResult(header.result)
    if (moves?.length) setGridRows(correctionsToGrid(moves))
  }

  function handleRescanComplete(review) {
    setReview(review)
    applyReviewToForm(review, {
      setGridRows,
      setWhiteName,
      setBlackName,
      setEventName,
      setRound,
      setBoard,
      setSection,
      setDate,
      setResult,
    })
  }

  useEffect(() => {
    if (!review?.scoresheet_url) return undefined
    let revoked = false
    fetch(review.scoresheet_url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        if (!revoked) setImageUrl(URL.createObjectURL(blob))
      })
      .catch(() => {})
    return () => {
      revoked = true
    }
  }, [review?.scoresheet_url])

  async function saveAndVerify() {
    setBusy(true)
    setError('')
    try {
      const payload = {
        moves: gridToCorrections(gridRows),
        result,
        white_name: whiteName,
        black_name: blackName,
        event_name: eventName,
        round: round ? parseInt(round, 10) : null,
        board: board ? parseInt(board, 10) : null,
        section: section || null,
        date: date || null,
        event_id: eventId || null,
      }
      const updated = await api.updateMoves(gameId, payload)
      setReview(updated)
      setGridRows(pairsToGrid(updated.moves))

      if (updated.validation.legal) {
        await api.verifyGame(gameId)
        navigate(`/games/${gameId}/replay`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!review && !error) return <div className="loading">Loading review…</div>

  const validation = review?.validation
  const year = date ? new Date(date).getFullYear() : null

  return (
    <div className="review-page scoresheet-review">
      <header className="review-header">
        <Link to="/library" className="back-link">← Back</Link>
        <h1>Correct scoresheet</h1>
        <p className="subtitle">
          {[eventName, year, round ? `Round ${round}` : null].filter(Boolean).join(' · ') || 'New game'}
        </p>
      </header>

      {error && <div className="alert error">{error}</div>}
      {review?.ocr_provider && (
        <div className="alert info">
          Smart scan: <strong>{review.ocr_provider}</strong>
          {review.ocr_warnings?.length > 0 && ` · ${review.ocr_warnings.length} note(s)`}
        </div>
      )}
      {review?.ocr_warnings?.some((w) => w.toLowerCase().includes('table') || w.toLowerCase().includes('landscape') || w.toLowerCase().includes('cut off') || w.toLowerCase().includes('resolution')) && (
        <div className="alert warn">
          <strong>Photo issue:</strong> The image may not show the full scoresheet. Re-shoot in portrait with the entire sheet filling the frame, or use Copilot → Re-read sheet after fixing the photo.
        </div>
      )}

      <div className="review-layout scoresheet-layout">
        <section className="review-image card scoresheet-photo-panel">
          <h2>Original scoresheet</h2>
          {imageUrl ? (
            <img src={imageUrl} alt="Scoresheet" className="scoresheet-full" />
          ) : (
            <div className="empty-image">No image attached</div>
          )}
        </section>

        <section className="review-moves card scoresheet-panel">
          <div className="scoresheet-brand">PIGEON · SCORESHEET REVIEW</div>

          <div className="scoresheet-meta">
            <label>Event<input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Tournament name" /></label>
            <label>Round<input value={round} onChange={(e) => setRound(e.target.value)} placeholder="3" /></label>
            <label>Date<input value={date} onChange={(e) => setDate(e.target.value)} placeholder="YYYY-MM-DD" /></label>
            <label>Section<input value={section} onChange={(e) => setSection(e.target.value)} placeholder="Open" /></label>
            <label>White<input value={whiteName} onChange={(e) => setWhiteName(e.target.value)} /></label>
            <label>Black<input value={blackName} onChange={(e) => setBlackName(e.target.value)} /></label>
            <label>Board<input value={board} onChange={(e) => setBoard(e.target.value)} placeholder="30" /></label>
            <label>
              Result
              <select value={result} onChange={(e) => setResult(e.target.value)}>
                {RESULTS.map((r) => (
                  <option key={r} value={r}>{r === '1-0' ? 'White wins' : r === '0-1' ? 'Black wins' : r === '1/2-1/2' ? 'Draw' : 'Unknown'}</option>
                ))}
              </select>
            </label>
          </div>

          <ScoresheetGrid rows={gridRows} onChange={setGridRows} validation={validation} />

          {validation && (
            <div className={`validation-banner ${validation.legal ? 'ok' : 'bad'}`}>
              {validation.legal
                ? '✓ All moves legal'
                : `✗ Problem at move ${validation.errors[0]?.ply}: ${validation.errors[0]?.reason} — click a ! suggestion`}
            </div>
          )}

          <div className="scoresheet-result-row">
            <span className={result === '1-0' ? 'result-ticked' : ''}>White wins</span>
            <span className={result === '0-1' ? 'result-ticked' : ''}>Black wins</span>
            <span className={result === '1/2-1/2' ? 'result-ticked' : ''}>Draw</span>
          </div>

          <div className="review-actions">
            <button type="button" className="btn-primary" onClick={saveAndVerify} disabled={busy}>
              {busy ? 'Saving…' : 'Save to event library'}
            </button>
          </div>
        </section>

        <CopilotPanel
          gameId={gameId}
          onApply={handleCopilotApply}
          onRescanComplete={handleRescanComplete}
        />
      </div>
    </div>
  )
}
