import { fetchWithAuth } from './client'

export function getCurrentUser() {
  return fetchWithAuth('/user/get-user')
}

export function updateUserProfile(body) {
  return fetchWithAuth('/user/update-user', {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}
