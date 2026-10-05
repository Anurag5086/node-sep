import { productImage } from '../utils/format'

export function productsById(products) {
  const map = new Map()
  for (const p of products) {
    if (p?._id) map.set(p._id, p)
  }
  return map
}

/**
 * Merge stored cart entries with live product records from the API.
 * Clamps quantity to current stock when stock is lower.
 */
export function mergeCartLines(entries, products) {
  const byId = productsById(products)

  return entries.map((entry) => {
    const product = byId.get(entry.productId)

    if (!product) {
      return {
        productId: entry.productId,
        quantity: entry.quantity,
        title: 'Product unavailable',
        brand: '',
        sellingPrice: 0,
        mrpPrice: 0,
        image: null,
        stockQuantity: 0,
        unavailable: true,
        removedFromStore: true,
      }
    }

    const stock = product.stockQuantity ?? 0
    const active = product.isActive !== false
    const quantity = stock > 0 ? Math.min(entry.quantity, stock) : entry.quantity

    return {
      productId: entry.productId,
      quantity,
      title: product.title,
      brand: product.brand,
      sellingPrice: product.sellingPrice,
      mrpPrice: product.mrpPrice,
      image: productImage(product),
      stockQuantity: stock,
      unavailable: !active || stock < 1,
      removedFromStore: false,
    }
  })
}

/** Apply stock clamps back to raw entries after a refresh. */
export function clampEntriesToStock(entries, products) {
  const byId = productsById(products)
  return entries
    .map((entry) => {
      const product = byId.get(entry.productId)
      if (!product || product.isActive === false) return null
      const stock = product.stockQuantity ?? 0
      if (stock < 1) return null
      return {
        productId: entry.productId,
        quantity: Math.min(entry.quantity, stock),
      }
    })
    .filter(Boolean)
}
