import { useLocation } from 'react-router-dom'
import ShoppingAssistant from './ShoppingAssistant'

const HIDDEN_PREFIXES = ['/admin', '/login', '/register']

export default function AssistantShell() {
  const { pathname } = useLocation()
  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))
  if (hidden) return null
  return <ShoppingAssistant />
}
