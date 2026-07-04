import { useAuth } from '../context/AuthContext'
import { PigeonProvider, usePigeon } from '../context/PigeonContext'
import ScanTab from './pigeon/ScanTab'
import ReviewTab from './pigeon/ReviewTab'
import ArchiveTab from './pigeon/ArchiveTab'
import DashboardTab from './pigeon/DashboardTab'
import ProfileTab from './pigeon/ProfileTab'

const TABS = [
  ['scan', 'Scan / Paste'],
  ['review', 'Review'],
  ['archive', 'Archive'],
  ['dashboard', 'Dashboard'],
  ['profile', 'Profile'],
]

function PigeonShellInner() {
  const { user } = useAuth()
  const { tab, setTab, toast, reviewGames } = usePigeon()

  return (
    <div className="pigeon-root">
      <div className="pigeon-shell">
        <header className="pigeon-header">
          <div>
            <div className="pigeon-title">
              Pige<span>on</span>
            </div>
            <div className="pigeon-sub">Permanent digital record for over-the-board chess</div>
          </div>
          {user?.name && (
            <div className="pigeon-header-actions mono" style={{ opacity: 0.65 }}>
              {user.name}
            </div>
          )}
        </header>

        <nav className="pigeon-nav">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? 'active' : ''}
              onClick={() => setTab(id)}
            >
              {label}
              {id === 'review' && reviewGames.length > 0 ? ` (${reviewGames.length})` : ''}
            </button>
          ))}
        </nav>

        {tab === 'scan' && <ScanTab />}
        {tab === 'review' && <ReviewTab />}
        {tab === 'archive' && <ArchiveTab />}
        {tab === 'dashboard' && <DashboardTab />}
        {tab === 'profile' && <ProfileTab />}

        {toast && <div className="pigeon-toast">{toast}</div>}
      </div>
    </div>
  )
}

export default function PigeonApp() {
  return (
    <PigeonProvider>
      <PigeonShellInner />
    </PigeonProvider>
  )
}
