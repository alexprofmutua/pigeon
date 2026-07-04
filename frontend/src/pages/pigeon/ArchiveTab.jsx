import { usePigeon } from '../../context/PigeonContext'
import { api } from '../../api/client'
import { downloadText } from '../../utils/chessMoves'

export default function ArchiveTab() {
  const { archive, activeEvent, setActiveEvent, backendOnline, loadArchive } = usePigeon()

  if (backendOnline === false) {
    return (
      <div className="pigeon-card" data-label="Archive">
        <p style={{ fontSize: 12, opacity: 0.7 }}>Backend offline — start the FastAPI server to load your synced archive.</p>
      </div>
    )
  }

  if (backendOnline === null) {
    return <div className="pigeon-empty">Checking backend…</div>
  }

  const byEvent = {}
  for (const g of archive.games) {
    const ev = archive.events.find((e) => e.id === g.event_id)
    const name = ev?.name || 'Unsorted'
    byEvent[name] = byEvent[name] || []
    byEvent[name].push(g)
  }
  const eventNames = Object.keys(byEvent)

  if (activeEvent && byEvent[activeEvent]) {
    const games = byEvent[activeEvent]
    return (
      <>
        <button type="button" className="ghost" style={{ marginBottom: 14 }} onClick={() => setActiveEvent(null)}>
          ← All tournaments
        </button>
        <div className="pigeon-card" data-label={`${activeEvent} (synced)`}>
          {games.map((g) => {
            const w = g.white_player_id ? archive.players[g.white_player_id]?.name : '?'
            const b = g.black_player_id ? archive.players[g.black_player_id]?.name : '?'
            return (
              <div key={g.id} className="pigeon-game-row">
                <div className="pigeon-result-badge">{g.result || '*'}</div>
                <div>
                  {w} <span style={{ opacity: 0.5 }}>vs</span> {b}{' '}
                  <span style={{ opacity: 0.5 }}>· {g.status}</span>
                </div>
                <div style={{ opacity: 0.6 }}>
                  {g.pgn ? (
                    <button
                      type="button"
                      className="ghost"
                      style={{ padding: '4px 8px', fontSize: 10 }}
                      onClick={async () => {
                        const pgn = await api.exportPgn(g.id)
                        downloadText(`${w}_vs_${b}.pgn`, pgn)
                      }}
                    >
                      PGN
                    </button>
                  ) : (
                    'unverified'
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  if (!eventNames.length) {
    return (
      <div className="pigeon-empty">
        Your permanent archive is empty. Save verified games from the Review tab to start building it.
        <br />
        <button type="button" className="ghost" style={{ marginTop: 14 }} onClick={loadArchive}>
          Refresh
        </button>
      </div>
    )
  }

  return (
    <div className="pigeon-tourn-list">
      {eventNames.map((name) => (
        <button key={name} type="button" className="pigeon-tourn-item" onClick={() => setActiveEvent(name)}>
          <div>
            <div className="name">
              {name} <span className="pigeon-tag" style={{ background: 'var(--board-green)' }}>synced</span>
            </div>
            <div className="meta">
              {byEvent[name].length} game{byEvent[name].length === 1 ? '' : 's'} on backend
            </div>
          </div>
          <div className="mono" style={{ fontSize: 11 }}>
            open →
          </div>
        </button>
      ))}
    </div>
  )
}
