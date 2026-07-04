import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function LibraryPage() {
  const [events, setEvents] = useState([])
  const [search, setSearch] = useState('')
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewEvent, setShowNewEvent] = useState(false)
  const [newEventName, setNewEventName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const [eventList, gameList] = await Promise.all([api.listEvents(), api.listGames()])
      setEvents(eventList)
      setGames(gameList)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(e) {
    e.preventDefault()
    try {
      const params = {}
      if (search.trim()) params.q = search.trim()
      const results = await api.searchGames(params)
      setGames(results)
    } catch (err) {
      setError(err.message)
    }
  }

  async function createEvent(e) {
    e.preventDefault()
    if (!newEventName.trim()) return
    try {
      await api.createEvent({ name: newEventName.trim() })
      setNewEventName('')
      setShowNewEvent(false)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="loading">Loading your archive…</div>

  return (
    <div className="library-page">
      <header className="page-header">
        <div>
          <h1>My Events</h1>
          <p className="subtitle">Every tournament, every board — organized forever.</p>
        </div>
        <button type="button" className="btn-secondary" onClick={() => setShowNewEvent(true)}>
          + New event
        </button>
      </header>

      {error && <div className="alert error">{error}</div>}

      {showNewEvent && (
        <form className="inline-form card" onSubmit={createEvent}>
          <input
            placeholder="Event name (e.g. NC Opens 2025)"
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-primary">Create</button>
          <button type="button" className="btn-ghost" onClick={() => setShowNewEvent(false)}>
            Cancel
          </button>
        </form>
      )}

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          placeholder="Search by player or event…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn-secondary">Search</button>
        {search && (
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setSearch('')
              load()
            }}
          >
            Clear
          </button>
        )}
      </form>

      <section className="event-list">
        {events.length === 0 ? (
          <div className="empty-state card">
            <h2>No events yet</h2>
            <p>Upload a scoresheet or create an event to start your archive.</p>
            <Link to="/upload" className="btn-primary">Scan a scoresheet</Link>
          </div>
        ) : (
          events.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`} className="event-card card">
              <div className="event-icon">📁</div>
              <div className="event-info">
                <h3>{event.name}</h3>
                <p>
                  {event.game_count} game{event.game_count !== 1 ? 's' : ''}
                  {event.year ? ` · ${event.year}` : ''}
                  {event.section ? ` · ${event.section}` : ''}
                </p>
              </div>
              <div className="event-meta">Last played: {formatDate(event.last_played)}</div>
            </Link>
          ))
        )}
      </section>

      {games.length > 0 && (
        <section className="recent-games">
          <h2>Recent games</h2>
          <div className="game-table card">
            {games.slice(0, 10).map((game) => (
              <Link key={game.id} to={`/games/${game.id}/replay`} className="game-row">
                <span>
                  {game.white_name || 'White'} vs {game.black_name || 'Black'}
                  {game.round ? ` · Rd ${game.round}` : ''}
                  {game.board ? ` · Bd ${game.board}` : ''}
                </span>
                <span className="muted">{game.event_year || '—'}</span>
                <span className={`status-pill status-${game.status}`}>{game.status.replace('_', ' ')}</span>
                <span className="result-score">{game.result || '*'}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
