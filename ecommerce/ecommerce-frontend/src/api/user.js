import { fetchWithAuth } from './client'

export function getCurrentUser() {
  return fetchWithAuth('/user/get-user')
}
