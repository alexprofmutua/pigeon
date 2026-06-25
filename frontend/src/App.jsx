import { useState } from 'react'
import CorrectionView from './components/CorrectionView'
import UploadView from './components/UploadView'
import './App.css'

function App() {
  const [screen, setScreen] = useState('upload')
  const [session, setSession] = useState(null)

  const handleUploaded = (data) => {
    setSession(data)
    setScreen('correct')
  }

  return (
    <div className="app">
      <nav className="top-nav">
        <span className="logo">Pigeon</span>
        <span className="nav-tag">scoresheet → PGN</span>
      </nav>

      {screen === 'upload' && <UploadView onUploaded={handleUploaded} />}

      {screen === 'correct' && (
        <CorrectionView
          previewUrl={session?.previewUrl}
          upload={session?.upload}
          onBack={() => setScreen('upload')}
        />
      )}
    </div>
  )
}

export default App
