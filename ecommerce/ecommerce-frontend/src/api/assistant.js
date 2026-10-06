import { API_BASE } from './config'
import { parseResponse } from './client'

export async function sendAssistantMessage(message) {
  const res = await fetch(`${API_BASE}/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  return parseResponse(res)
}
