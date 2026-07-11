import { useMemo, useState } from 'react'
import { usePigeon } from '../../context/PigeonContext'
import { api } from '../../api/client'
import { downloadText } from '../../utils/chessMoves'
import ReplayPanel from './ReplayPanel'

function matchesQuery(game, players, events, query) {
  if (!query.trim()) return true
  const q = query.trim().toLowerCase()
  const w = game.white_player_id ? players[game.white_player_id]?.name || '' : ''
  const b = game.black_player_id ? players[game.black_player_id]?.name || '' : ''
  const ev = events.find((e) => e.id === game.event_id)
  const eventName = ev?.name || 'Unsorted'
  const haystack = [w, b, eventName, game.result || '', game.status || ''].join(' ').toLowerCase()
  return haystack.includes(q)
}

export default function ArchiveTab() {
  const { archive, activeEvent, setActiveEvent, backendOnline, loadArchive, showToast } = usePigeon()
  const [query, setQuery] = useState('')
  const [newEventName, setNewEventName] = useState('')
  const [creating, setCreating] = useState(false)
  const [replayGame, setReplayGame] = useState(null)

  const byEvent = useMemo(() => {
    const grouped = {}
    for (const g of archive.games) {
      const ev = archive.events.find((e) => e.id === g.event_id)
      const name = ev?.name || 'Unsorted'
      if (!matchesQuery(g, archive.players, archive.events, query)) continue
      grouped[name] = grouped[name] || []
      grouped[name].push(g)
    }
    return grouped
  }, [archive, query])

  const eventNames = Object.keys(byEvent).sort()

  async function handleCreateEvent(e) {
    e.preventDefault()
    const name = newEventName.trim()
    if (!name) return
    setCreating(true)
    try {
      await api.createEvent({ name })
      setNewEventName('')
      await loadArchive()
      showToast(`Created event: ${name}`)
    } catch (err) {
      showToast(`Could not create event: ${err.message}`)
    } finally {
      setCreating(false)
    }
  }

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

  if (replayGame) {
    return (
      <ReplayPanel
        gameId={replayGame.id}
        white={replayGame.white}
        black={replayGame.black}
        onClose={() => setReplayGame(null)}
      />
    )
  }

  const searchBar = (
    <div className="pigeon-card" data-label="Search">
      <input
        type="text"
        placeholder="Filter by player, tournament, result…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  )

  const createEventForm = (
    <div className="pigeon-card" data-label="New Tournament">
      <form onSubmit={handleCreateEvent} className="pigeon-field-row" style={{ marginBottom: 0 }}>
        <div>
          <label>Event name</label>
          <input
            type="text"
            placeholder="e.g. NC Opens 2024"
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button type="submit" className="primary" style={{ marginTop: 0 }} disabled={creating}>
            {creating ? 'Creating…' : 'Create event'}
          </button>
        </div>
      </form>
    </div>
  )

  if (activeEvent && byEvent[activeEvent]) {
    const games = byEvent[activeEvent]
    return (
      <>
        {searchBar}
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
                  <span style={{ opacity: 0.5 }}>
                    · R{g.round || '?'}
                    {g.board ? ` · Bd${g.board}` : ''} · {g.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {g.pgn && g.status === 'verified' && (
                    <button
                      type="button"
                      className="ghost"
                      style={{ padding: '4px 8px', fontSize: 10 }}
                      onClick={() => setReplayGame({ id: g.id, white: w, black: b })}
                    >
                      Replay
                    </button>
                  )}
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
                    <span style={{ opacity: 0.6, fontSize: 10 }}>unverified</span>
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
      <>
        {createEventForm}
        {searchBar}
        <div className="pigeon-empty">
          {query
            ? 'No games match that search.'
            : 'Your permanent archive is empty. Save verified games from the Review tab to start building it.'}
          <br />
          <button type="button" className="ghost" style={{ marginTop: 14 }} onClick={loadArchive}>
            Refresh
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      {createEventForm}
      {searchBar}
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
    </>
  )
}
