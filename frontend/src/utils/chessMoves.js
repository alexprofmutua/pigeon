import { Chess } from 'chess.js'

function levenshtein(a, b) {
  const x = (a || '').toLowerCase()
  const y = (b || '').toLowerCase()
  const m = x.length
  const n = y.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i += 1) dp[i][0] = i
  for (let j = 0; j <= n; j += 1) dp[0][j] = j
  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      dp[i][j] =
        x[i - 1] === y[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

export function validateMoves(moveList) {
  const chess = new Chess()
  const out = []
  for (const raw of moveList) {
    const legalMoves = chess.moves()
    let mv = null
    try {
      mv = chess.move(raw)
    } catch {
      mv = null
    }
    if (mv) {
      out.push({ raw, san: mv.san, legal: true, suggestions: [] })
    } else {
      const ranked = legalMoves
        .map((m) => ({ m, d: levenshtein(raw, m) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 3)
        .map((x) => x.m)
      out.push({ raw, san: raw, legal: false, suggestions: ranked })
    }
  }
  return out
}

export function reviewToLocalGame(review) {
  const moves = []
  for (const pair of review.moves) {
    if (pair.white?.san) {
      moves.push({
        raw: pair.white.san,
        san: pair.white.san,
        legal: pair.white.valid !== false,
        confidence: pair.white.confidence,
        suggestions: pair.white.alternatives || [],
      })
    }
    if (pair.black?.san) {
      moves.push({
        raw: pair.black.san,
        san: pair.black.san,
        legal: pair.black.valid !== false,
        confidence: pair.black.confidence,
        suggestions: pair.black.alternatives || [],
      })
    }
  }
  return {
    backendGameId: review.game_id,
    tournament: review.header.event?.value || '',
    date: review.header.date?.value || '',
    round: review.header.round?.value || '',
    board: review.header.board?.value || '',
    section: review.header.section?.value || '',
    white: review.header.white?.value || '',
    black: review.header.black?.value || '',
    result: review.header.result?.value || '*',
    moves,
  }
}

export function localGameToPayload(game) {
  return {
    moves: game.moves.map((m, i) => ({ ply: i + 1, san: m.san })),
    result: game.result,
    white_name: game.white || null,
    black_name: game.black || null,
    event_name: game.tournament || null,
    board: game.board ? parseInt(game.board, 10) || null : null,
    section: game.section || null,
  }
}

export function pgnToLocalGame(pgnText) {
  const chess = new Chess()
  try {
    chess.loadPgn(pgnText)
    const history = chess.history()
    const headers = chess.header()
    return {
      tournament: headers.Event || '',
      date: (headers.Date || '').replace(/\./g, '-'),
      round: headers.Round || '',
      white: headers.White || '',
      black: headers.Black || '',
      result: headers.Result || '*',
      board: headers.Board || '',
      section: headers.Section || '',
      moves: validateMoves(history),
    }
  } catch {
    return null
  }
}

export function gameToPgn(game) {
  const headers = [
    ['Event', game.tournament || '?'],
    ['Site', '?'],
    ['Date', (game.date || '????.??.??').replace(/-/g, '.')],
    ['Round', game.round || '?'],
    ['White', game.white || '?'],
    ['Black', game.black || '?'],
    ['Result', game.result || '*'],
  ]
  if (game.board) headers.push(['Board', String(game.board)])
  if (game.section) headers.push(['Section', game.section])
  let out = `${headers.map(([k, v]) => `[${k} "${v}"]`).join('\n')}\n\n`
  let line = ''
  for (let i = 0; i < game.moves.length; i += 1) {
    if (i % 2 === 0) line += `${i / 2 + 1}. `
    line += `${game.moves[i].san || game.moves[i].raw} `
    if (line.length > 70) {
      out += `${line.trim()}\n`
      line = ''
    }
  }
  out += `${line.trim()} ${game.result || '*'}`
  return out
}

export function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
