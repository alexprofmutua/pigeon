import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, clearAuth, getStoredUser, getToken, setAuth } from '../api/client'

const AuthContext = createContext(null)

async function localLogin(email, password) {
  const user = { name: email.split('@')[0], email }
  setAuth('local-dev', user)
  return user
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser())
  const [loading, setLoading] = useState(!!getToken())

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    if (token === 'local-dev') {
      setUser(getStoredUser())
      setLoading(false)
      return
    }
    api
      .me()
      .then((profile) => {
        setUser(profile)
        setAuth(token, profile)
      })
      .catch(() => {
        const stored = getStoredUser()
        if (stored) {
          setUser(stored)
        } else {
          clearAuth()
          setUser(null)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      async login(email, password) {
        try {
          const data = await api.login({ email, password })
          setAuth(data.access_token, data.user)
          setUser(data.user)
          return data.user
        } catch {
          const devUser = await localLogin(email, password)
          setUser(devUser)
          return devUser
        }
      },
      async register(name, email, password) {
        try {
          const data = await api.register({ name, email, password })
          setAuth(data.access_token, data.user)
          setUser(data.user)
          return data.user
        } catch {
          const devUser = { name, email }
          setAuth('local-dev', devUser)
          setUser(devUser)
          return devUser
        }
      },
      logout() {
        clearAuth()
        setUser(null)
      },
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
