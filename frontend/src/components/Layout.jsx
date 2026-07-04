import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="app-shell">
      <header className="top-nav">
        <NavLink to="/" className="brand">
          <span className="brand-mark">♟</span>
          Pigeon
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/library">Library</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/upload" className="nav-upload">
            Upload +
          </NavLink>
        </nav>
        <div className="nav-user">
          <span>{user?.name}</span>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  )
}
