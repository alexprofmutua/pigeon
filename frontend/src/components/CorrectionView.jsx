const PLACEHOLDER_MOVES = [
  { number: 1, white: 'e4', black: 'e5', uncertain: false },
  { number: 2, white: 'Nf3', black: 'Nc6', uncertain: false },
  { number: 3, white: 'Bb5', black: 'a6', uncertain: true },
  { number: 4, white: 'Ba4', black: 'Nf6', uncertain: false },
]

export default function CorrectionView({ previewUrl, upload, onBack }) {
  const imageSrc = previewUrl || (upload ? `/api/v1/uploads/${upload.id}/image` : null)

  return (
    <section className="correction-view">
      <header className="correction-header">
        <button type="button" className="link-btn" onClick={onBack}>
          ← Back
        </button>
        <h1>Correct moves</h1>
        <span className="badge">Review</span>
      </header>

      <div className="correction-grid">
        <div className="panel scoresheet-panel">
          <h2>Scoresheet</h2>
          {imageSrc ? (
            <img src={imageSrc} alt="Uploaded scoresheet" className="scoresheet-image" />
          ) : (
            <p className="placeholder">No image</p>
          )}
        </div>

        <div className="panel moves-panel">
          <div className="meta-row">
            <label>
              White
              <input type="text" defaultValue="Player A" />
            </label>
            <label>
              Black
              <input type="text" defaultValue="Player B" />
            </label>
            <label>
              Result
              <select defaultValue="*">
                <option value="*">*</option>
                <option value="1-0">1-0</option>
                <option value="0-1">0-1</option>
                <option value="1/2-1/2">½-½</option>
              </select>
            </label>
          </div>

          <h2>Moves</h2>
          <ul className="move-list">
            {PLACEHOLDER_MOVES.map((move) => (
              <li key={move.number} className={move.uncertain ? 'move-uncertain' : ''}>
                <span className="move-number">{move.number}.</span>
                <input type="text" className="move-input" defaultValue={move.white} />
                <input type="text" className="move-input" defaultValue={move.black} />
                {move.uncertain && <span className="uncertain-tag">check</span>}
              </li>
            ))}
          </ul>

          <p className="validation-msg validation-ok">Shell layout — wire to API in Week 3</p>

          <div className="actions">
            <button type="button" className="primary">
              Save to library
            </button>
            <button type="button" className="secondary">
              Export PGN
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
