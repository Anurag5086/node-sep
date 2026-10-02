const CART_KEY = 'luxemart_cart'

export function loadCartItems() {
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCartItems(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function productToCartLine(product) {
  return {
    productId: product._id,
    title: product.title,
    brand: product.brand,
    sellingPrice: product.sellingPrice,
    mrpPrice: product.mrpPrice,
    image: product.images?.[0]?.trim() || null,
    stockQuantity: product.stockQuantity ?? 0,
    quantity: 1,
  }
}
