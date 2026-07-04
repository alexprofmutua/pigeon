import { useState } from 'react'
import { api } from '../api/client'

export default function CopilotPanel({ gameId, onApply, onRescanComplete }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'I can re-read your scoresheet or fix illegal moves. Try a quick action below.' },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState(null)

  async function send(quickAction, message = '') {
    setBusy(true)
    setPending(null)
    const userText = quickAction === 'rescan' ? 'Re-read entire scoresheet' : quickAction === 'fix_errors' ? 'Fix illegal moves' : message
    setMessages((prev) => [...prev, { role: 'user', text: userText }])
    try {
      if (quickAction === 'rescan') {
        setMessages((prev) => [...prev, { role: 'assistant', text: 'Re-scanning with agentic OCR… (~30–45s)' }])
        const review = await api.rescanGame(gameId)
        onRescanComplete?.(review)
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: 'assistant', text: 'Done — grid updated from a fresh multi-pass read.' },
        ])
        return
      }

      const data = await api.copilot(gameId, { message, quick_action: quickAction || null })
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }])
      if (data.actions) setPending(data.actions)
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', text: `Error: ${err.message}` }])
    } finally {
      setBusy(false)
      setInput('')
    }
  }

  function applyPending() {
    if (!pending) return
    onApply?.({
      header: pending.header || {},
      moves: pending.moves || [],
    })
    setPending(null)
    setMessages((prev) => [...prev, { role: 'assistant', text: 'Applied to the review grid — check and save.' }])
  }

  return (
    <aside className="copilot-panel card">
      <div className="copilot-head">
        <h2>AI Copilot</h2>
        <span className="copilot-badge">gpt-4o</span>
      </div>

      <div className="copilot-quick">
        <button type="button" className="btn-secondary" disabled={busy} onClick={() => send('rescan')}>
          Re-read sheet
        </button>
        <button type="button" className="btn-secondary" disabled={busy} onClick={() => send('fix_errors')}>
          Fix errors
        </button>
      </div>

      <div className="copilot-messages">
        {messages.map((m, i) => (
          <div key={i} className={`copilot-msg ${m.role}`}>
            {m.text}
          </div>
        ))}
        {busy && <div className="copilot-msg assistant">Thinking…</div>}
      </div>

      {pending && (
        <div className="copilot-pending">
          <p>Copilot has suggested changes.</p>
          <button type="button" className="btn-primary" onClick={applyPending}>
            Apply to grid
          </button>
        </div>
      )}

      <form
        className="copilot-input"
        onSubmit={(e) => {
          e.preventDefault()
          if (input.trim()) send(null, input.trim())
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a move…"
          disabled={busy}
        />
        <button type="submit" className="btn-primary" disabled={busy || !input.trim()}>
          Send
        </button>
      </form>
    </aside>
  )
}
