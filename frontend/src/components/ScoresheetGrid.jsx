const LOW_CONFIDENCE = 0.85

export function pairsToGrid(pairs, maxRows = 60) {
  const rows = Array.from({ length: maxRows }, (_, i) => ({
    moveNumber: i + 1,
    white: { san: '', confidence: null, valid: null, alternatives: [], ply: i * 2 + 1 },
    black: { san: '', confidence: null, valid: null, alternatives: [], ply: i * 2 + 2 },
  }))

  for (const pair of pairs || []) {
    const idx = pair.move_number - 1
    if (idx < 0 || idx >= maxRows) continue
    rows[idx].white = {
      san: pair.white?.san || '',
      confidence: pair.white?.confidence ?? null,
      valid: pair.white?.valid ?? null,
      alternatives: pair.white?.alternatives || [],
      ply: idx * 2 + 1,
    }
    rows[idx].black = {
      san: pair.black?.san || '',
      confidence: pair.black?.confidence ?? null,
      valid: pair.black?.valid ?? null,
      alternatives: pair.black?.alternatives || [],
      ply: idx * 2 + 2,
    }
  }
  return rows
}

export function gridToFlat(rows) {
  const moves = []
  for (const row of rows) {
    if (row.white.san?.trim()) {
      moves.push({ ...row.white, color: 'white', moveNumber: row.moveNumber })
    }
    if (row.black.san?.trim()) {
      moves.push({ ...row.black, color: 'black', moveNumber: row.moveNumber })
    }
  }
  return moves
}

export function gridToCorrections(rows) {
  return gridToFlat(rows)
    .filter((m) => m.san.trim())
    .map((m) => ({ ply: m.ply, san: m.san.trim() }))
}

export function moveHasIssue(move) {
  const uncertain = move.confidence != null && move.confidence < LOW_CONFIDENCE
  const invalid = move.valid === false
  return uncertain || invalid
}

export default function ScoresheetGrid({ rows, onChange, validation }) {
  const columns = [
    rows.slice(0, 20),
    rows.slice(20, 40),
    rows.slice(40, 60),
  ]

  function updateCell(moveNumber, color, san) {
    onChange(
      rows.map((row) => {
        if (row.moveNumber !== moveNumber) return row
        return {
          ...row,
          [color]: { ...row[color], san },
        }
      }),
    )
  }

  function applySuggestion(moveNumber, color, san) {
    updateCell(moveNumber, color, san)
  }

  return (
    <div className="scoresheet-form">
      <div className="scoresheet-grid-head">
        <span>WHITE</span>
        <span>BLACK</span>
        <span>WHITE</span>
        <span>BLACK</span>
        <span>WHITE</span>
        <span>BLACK</span>
      </div>
      <div className="scoresheet-grid-cols">
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="scoresheet-col-pair">
            {col.map((row) => (
              <div key={row.moveNumber} className="scoresheet-row">
                <span className="scoresheet-num">{row.moveNumber}.</span>
                {(['white', 'black']).map((color) => {
                  const cell = row[color]
                  const issue = moveHasIssue(cell)
                  return (
                    <div
                      key={color}
                      className={`scoresheet-cell ${issue ? 'has-issue' : ''}`}
                    >
                      <input
                        value={cell.san}
                        onChange={(e) => updateCell(row.moveNumber, color, e.target.value)}
                        aria-label={`Move ${row.moveNumber} ${color}`}
                      />
                      {issue && (
                        <div className="move-issue">
                          <span className="issue-mark" title="Check this move">!</span>
                          {cell.alternatives?.length > 0 && (
                            <div className="suggestions">
                              {cell.alternatives.map((alt) => (
                                <button
                                  key={alt}
                                  type="button"
                                  className="suggestion-chip"
                                  onClick={() => applySuggestion(row.moveNumber, color, alt)}
                                >
                                  {alt}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
