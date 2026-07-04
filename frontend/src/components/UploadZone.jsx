import { useRef, useState } from 'react'

export default function UploadZone({ onFile, disabled }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  function handleFiles(files) {
    const file = files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      className={`upload-zone ${dragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        if (!disabled) handleFiles(e.dataTransfer.files)
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="upload-framing-guide" aria-hidden="true">
        <div className="framing-sheet">
          <span className="framing-header" />
          <span className="framing-grid" />
        </div>
      </div>
      <div className="upload-icon">📷</div>
      <p className="upload-title">Take a photo or drop a scoresheet</p>
      <p className="upload-hint">Fill the frame with the whole sheet — header and move grid</p>
      <p className="upload-hint subtle">Portrait · good lighting · JPEG, PNG, WebP · up to 10 MB</p>
    </div>
  )
}
