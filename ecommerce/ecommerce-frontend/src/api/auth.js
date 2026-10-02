import { API_BASE } from './config'
import { parseResponse } from './client'
import { clearToken, setToken } from './token'

export function registerUser({ name, email, password }) {
  return fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  }).then(parseResponse)
}

export function loginUser({ email, password }) {
  return fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })
    .then(parseResponse)
    .then((data) => {
      if (data.token) setToken(data.token)
      return data
    })
}

export function logoutUser() {
  clearToken()
}
