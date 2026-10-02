import { API_BASE } from './config'
import { getToken } from './token'

function authHeaders(extra = {}) {
  const headers = { ...extra }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

export async function parseResponse(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      data.message ||
      (typeof data.error === 'string' ? data.error : 'Something went wrong')
    throw new Error(message)
  }
  return data
}

/** Backend returns 404 when lists are empty — treat as []. */
export async function fetchList(path, key) {
  const res = await fetch(`${API_BASE}${path}`)
  const data = await res.json().catch(() => ({}))
  if (res.status === 404) return []
  if (!res.ok) {
    throw new Error(data.message || 'Failed to load data')
  }
  return data[key] ?? []
}

export function fetchWithAuth(path, options = {}) {
  const headers = authHeaders({ ...options.headers })
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  return fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  }).then(parseResponse)
}

/** Authenticated list fetch; empty 404 → []. */
export async function fetchAuthList(path, key) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: authHeaders(),
  })
  const data = await res.json().catch(() => ({}))
  if (res.status === 404) return []
  if (!res.ok) {
    throw new Error(data.message || 'Failed to load data')
  }
  return data[key] ?? []
}
