import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

function pct(value) {
  if (value == null) return '—'
  return `${Math.round(value * 100)}%`
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .dashboard()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading stats…</div>
  if (error) return <div className="alert error">{error}</div>
  if (!stats) return null

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">Your chess life at a glance — from every saved game.</p>
        </div>
        <Link to="/upload" className="btn-primary">Scan another game</Link>
      </header>

      {stats.total_games === 0 ? (
        <div className="empty-state card">
          <h2>No verified games yet</h2>
          <p>Scan and verify a scoresheet to see your stats here.</p>
          <Link to="/upload" className="btn-primary">Get started</Link>
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card card">
              <span className="stat-value">{stats.total_games}</span>
              <span className="stat-label">Games saved</span>
            </div>
            <div className="stat-card card">
              <span className="stat-value">{stats.results.wins}</span>
              <span className="stat-label">Wins (1-0)</span>
            </div>
            <div className="stat-card card">
              <span className="stat-value">{stats.results.losses}</span>
              <span className="stat-label">Losses (0-1)</span>
            </div>
            <div className="stat-card card">
              <span className="stat-value">{stats.results.draws}</span>
              <span className="stat-label">Draws</span>
            </div>
          </div>

          <div className="dashboard-panels">
            <section className="card panel">
              <h2>Win rate by color</h2>
              <div className="rate-row">
                <div>
                  <strong>As White</strong>
                  <p>{stats.games_as_white} games · {pct(stats.win_rate_as_white)} win rate</p>
                </div>
                <div>
                  <strong>As Black</strong>
                  <p>{stats.games_as_black} games · {pct(stats.win_rate_as_black)} win rate</p>
                </div>
              </div>
              <p className="hint muted">Matched when your name appears on the scoresheet.</p>
            </section>

            <section className="card panel">
              <h2>Top openings as White</h2>
              {stats.top_openings_as_white.length === 0 ? (
                <p className="muted">No data yet</p>
              ) : (
                <ul className="opening-list">
                  {stats.top_openings_as_white.map((o) => (
                    <li key={o.name}>
                      <code>{o.name}</code>
                      <span>{o.count}×</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card panel">
              <h2>Top openings as Black</h2>
              {stats.top_openings_as_black.length === 0 ? (
                <p className="muted">No data yet</p>
              ) : (
                <ul className="opening-list">
                  {stats.top_openings_as_black.map((o) => (
                    <li key={o.name}>
                      <code>{o.name}</code>
                      <span>{o.count}×</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  )
}
