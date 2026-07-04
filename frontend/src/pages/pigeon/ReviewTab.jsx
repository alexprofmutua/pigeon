import { useState } from 'react'
import { usePigeon } from '../../context/PigeonContext'

const RESULTS = ['1-0', '0-1', '1/2-1/2', '*']

function MoveCell({ gameIdx, move, plyIdx, onApply }) {
  const [open, setOpen] = useState(false)

  if (!move) return <div />

  return (
    <div
      className={`pigeon-movecell ${move.legal ? '' : 'bad'}`}
      onClick={() => {
        if (!move.legal) setOpen(!open)
      }}
    >
      {move.san || move.raw}
      {!move.legal && open && move.suggestions?.length > 0 && (
        <div className="pigeon-suggestions">
          {move.suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                onApply(gameIdx, plyIdx, s)
                setOpen(false)
              }}
            >
              {s} <span style={{ opacity: 0.6 }}>(suggested)</span>
            </button>
          ))}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              const val = prompt('Enter the move in SAN (e.g. Nf3, exd5, O-O):')
              if (val) onApply(gameIdx, plyIdx, val.trim())
              setOpen(false)
            }}
          >
            Enter manually…
          </button>
        </div>
      )}
    </div>
  )
}

export default function ReviewTab() {
  const {
    reviewGames,
    updateReviewGame,
    applySuggestion,
    saveReviewGame,
    discardReviewGame,
    pollReviewQueue,
    backendOnline,
  } = usePigeon()
  const [busy, setBusy] = useState(null)

  if (!reviewGames.length) {
    return (
      <>
        {backendOnline && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              opacity: 0.75,
            }}
          >
            <span>Scans from other devices appear here automatically (checks every ~7s).</span>
            <button type="button" className="ghost" style={{ padding: '5px 10px', fontSize: 10 }} onClick={pollReviewQueue}>
              ↻ Check now
            </button>
          </div>
        )}
        <div className="pigeon-empty">No games queued for review. Scan photos or paste a PGN first.</div>
      </>
    )
  }

  return (
    <>
      {backendOnline && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            opacity: 0.75,
          }}
        >
          <span>Scans from other devices appear here automatically (checks every ~7s).</span>
          <button type="button" className="ghost" style={{ padding: '5px 10px', fontSize: 10 }} onClick={pollReviewQueue}>
            ↻ Check now
          </button>
        </div>
      )}
      {reviewGames.map((g, gi) => {
        const errCount = g.moves.filter((m) => !m.legal).length
        const rows = []
        for (let i = 0; i < g.moves.length; i += 2) {
          rows.push({ num: i / 2 + 1, w: g.moves[i], wIdx: i, b: g.moves[i + 1], bIdx: i + 1 })
        }
        const label = `Game ${gi + 1} of ${reviewGames.length}${errCount ? ` · ${errCount} flagged` : ''}`

        return (
          <div key={g.backendGameId || gi} className="pigeon-card" data-label={label}>
            {g.backendGameId && (
              <span className="pigeon-tag" style={{ background: 'var(--board-green)', position: 'absolute', top: -10, right: 14 }}>
                synced
              </span>
            )}
            <div className="pigeon-field-row">
              <div>
                <label>Tournament</label>
                <input
                  type="text"
                  value={g.tournament}
                  onChange={(e) => updateReviewGame(gi, { tournament: e.target.value })}
                />
              </div>
              <div>
                <label>Section</label>
                <input
                  type="text"
                  value={g.section || ''}
                  placeholder="Open, U1800, etc."
                  onChange={(e) => updateReviewGame(gi, { section: e.target.value })}
                />
              </div>
            </div>
            <div className="pigeon-field-row">
              <div>
                <label>Round</label>
                <input type="text" value={g.round} onChange={(e) => updateReviewGame(gi, { round: e.target.value })} />
              </div>
              <div>
                <label>Board</label>
                <input type="text" value={g.board || ''} onChange={(e) => updateReviewGame(gi, { board: e.target.value })} />
              </div>
            </div>
            <div className="pigeon-field-row">
              <div>
                <label>White</label>
                <input type="text" value={g.white} onChange={(e) => updateReviewGame(gi, { white: e.target.value })} />
              </div>
              <div>
                <label>Black</label>
                <input type="text" value={g.black} onChange={(e) => updateReviewGame(gi, { black: e.target.value })} />
              </div>
            </div>
            <div className="pigeon-field-row">
              <div>
                <label>Date</label>
                <input type="date" value={g.date} onChange={(e) => updateReviewGame(gi, { date: e.target.value })} />
              </div>
              <div>
                <label>Result</label>
                <select value={g.result} onChange={(e) => updateReviewGame(gi, { result: e.target.value })}>
                  {RESULTS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="pigeon-movegrid">
              <div className="hd">#</div>
              <div className="hd">White</div>
              <div className="hd">Black</div>
              {rows.map((r) => (
                <div key={r.num} style={{ display: 'contents' }}>
                  <div>{r.num}</div>
                  <MoveCell gameIdx={gi} move={r.w} plyIdx={r.wIdx} onApply={applySuggestion} />
                  {r.b ? (
                    <MoveCell gameIdx={gi} move={r.b} plyIdx={r.bIdx} onApply={applySuggestion} />
                  ) : (
                    <div />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                type="button"
                className="primary"
                disabled={busy === gi}
                onClick={async () => {
                  setBusy(gi)
                  try {
                    await saveReviewGame(gi)
                  } catch (err) {
                    alert(err.message)
                  } finally {
                    setBusy(null)
                  }
                }}
              >
                {busy === gi ? 'Saving…' : 'Confirm & save to archive'}
              </button>
              <button type="button" className="ghost" onClick={() => discardReviewGame(gi)}>
                Discard
              </button>
            </div>
          </div>
        )
      })}
    </>
  )
}
