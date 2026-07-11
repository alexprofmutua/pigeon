import { Chess } from 'chess.js'

export function pgnToReplay(pgnText) {
  const chess = new Chess()
  chess.loadPgn(pgnText)
  const headers = chess.header()
  const history = chess.history()
  const fenPositions = []
  const walker = new Chess()
  fenPositions.push(walker.fen())
  for (const san of history) {
    walker.move(san)
    fenPositions.push(walker.fen())
  }
  return {
    white: headers.White || 'White',
    black: headers.Black || 'Black',
    event: headers.Event || '',
    result: headers.Result || '*',
    moves: history,
    fenPositions,
  }
}

export function openingKeyFromMoves(moves, color) {
  const start = color === 'white' ? 0 : 1
  const slice = []
  for (let i = start; i < moves.length && slice.length < 4; i += 2) {
    slice.push(moves[i])
  }
  return slice.join(' ') || '(unrecorded)'
}
