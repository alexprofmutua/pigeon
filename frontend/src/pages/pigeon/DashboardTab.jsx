import { useMemo } from 'react'
import { usePigeon } from '../../context/PigeonContext'

function isUser(name, profileName) {
  if (!name || !profileName) return false
  return name.trim().toLowerCase() === profileName.trim().toLowerCase()
}

export default function DashboardTab() {
  const { profile, archive } = usePigeon()

  const stats = useMemo(() => {
    const games = archive.games.filter((g) => g.status === 'verified')
    let wins = 0
    let losses = 0
    let draws = 0
    const openingsWhite = {}
    const openingsBlack = {}
    const opponents = {}
    const tournamentScore = {}

    for (const g of games) {
      const w = g.white_player_id ? archive.players[g.white_player_id]?.name : ''
      const b = g.black_player_id ? archive.players[g.black_player_id]?.name : ''
      const userIsWhite = isUser(w, profile.name)
      const userIsBlack = isUser(b, profile.name)
      if (!userIsWhite && !userIsBlack) continue

      const opp = userIsWhite ? b : w
      let outcome = null
      if (g.result === '1-0') outcome = userIsWhite ? 'w' : 'l'
      else if (g.result === '0-1') outcome = userIsBlack ? 'w' : 'l'
      else if (g.result === '1/2-1/2') outcome = 'd'
      if (outcome === 'w') wins += 1
      else if (outcome === 'l') losses += 1
      else if (outcome === 'd') draws += 1

      if (opp) {
        opponents[opp] = opponents[opp] || { w: 0, l: 0, d: 0 }
        if (outcome === 'w') opponents[opp].w += 1
        else if (outcome === 'l') opponents[opp].l += 1
        else if (outcome === 'd') opponents[opp].d += 1
      }

      const pts = outcome === 'w' ? 1 : outcome === 'd' ? 0.5 : 0
      const ev = archive.events.find((e) => e.id === g.event_id)
      const tName = ev?.name || 'Unsorted'
      tournamentScore[tName] = tournamentScore[tName] || { pts: 0, games: 0 }
      tournamentScore[tName].pts += pts
      tournamentScore[tName].games += 1
    }

    const bestTournament = Object.entries(tournamentScore)
      .map(([name, v]) => ({ name, pct: v.games ? (v.pts / v.games) * 100 : 0, pts: v.pts, games: v.games }))
      .sort((a, b) => b.pct - a.pct)[0]

    const bestOpponent = Object.entries(opponents)
      .map(([name, v]) => ({ name, score: v.w - v.l, ...v, total: v.w + v.l + v.d }))
      .filter((o) => o.total >= 1)
      .sort((a, b) => b.score - a.score)[0]

    return {
      total: wins + losses + draws,
      wins,
      losses,
      draws,
      bestTournament,
      bestOpponent,
      openingsWhite: [],
      openingsBlack: [],
    }
  }, [archive, profile.name])

  if (!profile.name) {
    return <div className="pigeon-empty">Set your name in Profile first so we know which side of each game is yours.</div>
  }

  if (!stats.total) {
    return (
      <div className="pigeon-empty">
        No verified archive games involve &quot;{profile.name}&quot; yet.
      </div>
    )
  }

  const winPct = stats.total ? Math.round(((stats.wins + stats.draws * 0.5) / stats.total) * 100) : 0

  return (
    <>
      <div className="pigeon-stat-grid" style={{ marginBottom: 20 }}>
        <div className="pigeon-stat-box">
          <div className="num">{stats.total}</div>
          <div className="lbl">Games</div>
        </div>
        <div className="pigeon-stat-box">
          <div className="num">{stats.wins}</div>
          <div className="lbl">Wins</div>
        </div>
        <div className="pigeon-stat-box">
          <div className="num">{stats.losses}</div>
          <div className="lbl">Losses</div>
        </div>
        <div className="pigeon-stat-box">
          <div className="num">{stats.draws}</div>
          <div className="lbl">Draws</div>
        </div>
      </div>
      <div className="pigeon-card" data-label="Score Rate">
        <div className="pigeon-bar-row">
          <div className="lbl">Overall</div>
          <div className="track">
            <div className="fill" style={{ width: `${winPct}%` }} />
          </div>
          <div className="val">{winPct}%</div>
        </div>
      </div>
      <div className="pigeon-card" data-label="Best Tournament">
        {stats.bestTournament ? (
          <>
            <div className="display" style={{ fontSize: 18 }}>
              {stats.bestTournament.name}
            </div>
            <div className="mono" style={{ fontSize: 12, opacity: 0.7 }}>
              {stats.bestTournament.pts} / {stats.bestTournament.games} points (
              {Math.round(stats.bestTournament.pct)}%)
            </div>
          </>
        ) : (
          '—'
        )}
      </div>
      <div className="pigeon-card" data-label="Head-to-Head Leader">
        {stats.bestOpponent ? (
          <>
            <div className="display" style={{ fontSize: 18 }}>
              {stats.bestOpponent.name}
            </div>
            <div className="mono" style={{ fontSize: 12, opacity: 0.7 }}>
              +{stats.bestOpponent.w} ={stats.bestOpponent.d} -{stats.bestOpponent.l}
            </div>
          </>
        ) : (
          '—'
        )}
      </div>
    </>
  )
}
