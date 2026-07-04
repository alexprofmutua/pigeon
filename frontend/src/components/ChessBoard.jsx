import { Chess } from 'chess.js'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const PIECE_UNICODE = {
  wK: '♔',
  wQ: '♕',
  wR: '♖',
  wB: '♗',
  wN: '♘',
  wP: '♙',
  bK: '♚',
  bQ: '♛',
  bR: '♜',
  bB: '♝',
  bN: '♞',
  bP: '♟',
}

export default function ChessBoard({ fen, orientation = 'white', highlightSquares = [] }) {
  const board = new Chess(fen || undefined)
  const squares = []

  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const displayRank = orientation === 'white' ? 7 - rank : rank
      const displayFile = orientation === 'white' ? file : 7 - file
      const square = `${FILES[displayFile]}${displayRank + 1}`
      const piece = board.get(square)
      const isLight = (displayRank + displayFile) % 2 === 0
      squares.push(
        <div
          key={square}
          className={`sq ${isLight ? 'light' : 'dark'} ${highlightSquares.includes(square) ? 'highlight' : ''}`}
        >
          {piece ? PIECE_UNICODE[`${piece.color}${piece.type.toUpperCase()}`] : null}
        </div>,
      )
    }
  }

  return (
    <div className="chess-board-wrap">
      <div className="chess-board">{squares}</div>
    </div>
  )
}
