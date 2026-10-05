const CART_KEY = 'luxemart_cart'

/** Persist only product id + quantity; details come from the API. */
export function normalizeCartEntry(item) {
  if (!item) return null
  const productId = item.productId ?? item._id
  const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1))
  if (!productId) return null
  return { productId, quantity }
}

export function loadCartItems() {
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeCartEntry).filter(Boolean)
  } catch {
    return []
  }
}

export function saveCartItems(entries) {
  localStorage.setItem(CART_KEY, JSON.stringify(entries))
}
