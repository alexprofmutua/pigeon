const TOKEN_KEY = 'pigeon_token'
const USER_KEY = 'pigeon_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  const token = getToken()
  if (token && token !== 'local-dev') {
    headers.Authorization = `Bearer ${token}`
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(path, { ...options, headers })

  if (response.status === 401 && token && token !== 'local-dev') {
    clearAuth()
    window.location.href = '/login'
    throw new Error('Session expired')
  }

  if (!response.ok) {
    let detail = response.statusText
    try {
      const data = await response.json()
      detail = data.detail || detail
    } catch {
      /* plain text error */
    }
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }
  return response.text()
}

export const api = {
  register: (body) => request('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/api/v1/auth/me'),

  listEvents: () => request('/api/v1/events'),
  createEvent: (body) => request('/api/v1/events', { method: 'POST', body: JSON.stringify(body) }),
  getEvent: (id) => request(`/api/v1/events/${id}`),

  listPlayers: () => request('/api/v1/players'),

  listGames: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return request(`/api/v1/games${qs ? `?${qs}` : ''}`)
  },
  getGame: (id) => request(`/api/v1/games/${id}`),
  getReview: (id) => request(`/api/v1/games/${id}/review`),
  updateMoves: (id, body) =>
    request(`/api/v1/games/${id}/moves`, { method: 'PATCH', body: JSON.stringify(body) }),
  verifyGame: (id) => request(`/api/v1/games/${id}/verify`, { method: 'POST' }),
  exportPgn: (id) => request(`/api/v1/games/${id}/pgn`),

  upload: (file, gameId) => {
    const form = new FormData()
    form.append('file', file)
    const qs = gameId ? `?game_id=${gameId}` : ''
    return request(`/api/v1/uploads${qs}`, { method: 'POST', body: form })
  },
  processUpload: (id) => request(`/api/v1/uploads/${id}/process`, { method: 'POST' }),
}
