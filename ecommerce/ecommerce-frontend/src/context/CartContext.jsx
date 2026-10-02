import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  loadCartItems,
  productToCartLine,
  saveCartItems,
} from '../cart/cartStorage'
import { CartContext } from './cart-context'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => loadCartItems())
  const [lastAddedId, setLastAddedId] = useState(null)

  useEffect(() => {
    saveCartItems(items)
  }, [items])

  useEffect(() => {
    if (!lastAddedId) return undefined
    const t = setTimeout(() => setLastAddedId(null), 2000)
    return () => clearTimeout(t)
  }, [lastAddedId])

  const addToCart = useCallback((product, quantity = 1) => {
    if (!product?._id || product.stockQuantity < 1) return false

    const qtyToAdd = Math.max(1, Math.floor(quantity))
    let added = false

    setItems((prev) => {
      const index = prev.findIndex((line) => line.productId === product._id)
      if (index === -1) {
        const line = productToCartLine(product)
        line.quantity = Math.min(qtyToAdd, product.stockQuantity)
        added = true
        return [...prev, line]
      }

      const next = [...prev]
      const max = product.stockQuantity
      const newQty = Math.min(next[index].quantity + qtyToAdd, max)
      if (newQty === next[index].quantity) return prev
      next[index] = {
        ...next[index],
        sellingPrice: product.sellingPrice,
        mrpPrice: product.mrpPrice,
        stockQuantity: max,
        quantity: newQty,
      }
      added = true
      return next
    })

    if (added) setLastAddedId(product._id)
    return added
  }, [])

  const removeFromCart = useCallback((productId) => {
    setItems((prev) => prev.filter((line) => line.productId !== productId))
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    setItems((prev) =>
      prev.map((line) => {
        if (line.productId !== productId) return line
        const max = line.stockQuantity
        const qty = Math.min(Math.max(1, Math.floor(quantity)), max)
        return { ...line, quantity: qty }
      }),
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const cartCount = useMemo(
    () => items.reduce((sum, line) => sum + line.quantity, 0),
    [items],
  )

  const subtotal = useMemo(
    () => items.reduce((sum, line) => sum + line.sellingPrice * line.quantity, 0),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      cartCount,
      subtotal,
      lastAddedId,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [
      items,
      cartCount,
      subtotal,
      lastAddedId,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
