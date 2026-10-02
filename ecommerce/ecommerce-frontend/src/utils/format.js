export function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function discountPercent(mrp, selling) {
  if (!mrp || mrp <= selling) return 0
  return Math.round(((mrp - selling) / mrp) * 100)
}

export function productCategoryId(product) {
  const id = product?.categoryId
  if (!id) return null
  if (typeof id === 'string') return id
  return id._id ?? id.id ?? null
}

export function productImage(product) {
  const url = product?.images?.[0]
  return url?.trim() ? url : null
}
