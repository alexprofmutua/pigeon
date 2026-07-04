import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'

export default function EventDetailPage() {
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [games, setGames] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getEvent(eventId), api.listEventGames(eventId)])
      .then(([evt, gameList]) => {
        setEvent(evt)
        setGames(gameList)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [eventId])

  if (loading) return <div className="loading">Loading event…</div>
  if (error) return <div className="alert error">{error}</div>
  if (!event) return null

  return (
    <div className="event-detail-page">
      <Link to="/library" className="back-link">← Back to library</Link>
      <header className="page-header">
        <div>
          <h1>{event.name}</h1>
          <p className="subtitle">
            {[
              event.start_date ? new Date(event.start_date).getFullYear() : null,
              event.section,
              event.location,
            ].filter(Boolean).join(' · ') || 'Event archive'}
          </p>
        </div>
        <Link to="/upload" className="btn-primary">Upload scoresheet</Link>
      </header>

      {games.length === 0 ? (
        <div className="empty-state card">
          <h2>No games in this event yet</h2>
          <p>Scan a scoresheet and assign it to this event during review.</p>
        </div>
      ) : (
        <div className="game-table card">
          {games.map((game) => (
            <div key={game.id} className="game-row-actions">
              <Link to={`/games/${game.id}/replay`} className="game-row">
                <span>
                  {game.white_name || 'White'} vs {game.black_name || 'Black'}
                  {game.round ? ` · Rd ${game.round}` : ''}
                  {game.board ? ` · Bd ${game.board}` : ''}
                </span>
                <span className={`status-pill status-${game.status}`}>{game.status.replace('_', ' ')}</span>
                <span className="result-score">{game.result || '*'}</span>
              </Link>
              {game.status === 'needs_review' && (
                <Link to={`/games/${game.id}/review`} className="btn-secondary small">
                  Review
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
