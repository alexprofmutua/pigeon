const API_BASE = '/api/v1'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options)
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed (${response.status})`)
  }
  return response.json()
}

export async function checkHealth() {
  const response = await fetch('/health')
  if (!response.ok) throw new Error('Backend unreachable')
  return response.json()
}

export async function uploadScoresheet(file) {
  const form = new FormData()
  form.append('file', file)
  return request('/uploads', { method: 'POST', body: form })
}

export async function processUpload(uploadId) {
  return request(`/uploads/${uploadId}/process`, { method: 'POST' })
}

export function scoresheetImageUrl(uploadId) {
  return `${API_BASE}/uploads/${uploadId}/image`
}
