import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getAllProducts } from '../api/catalog'
import { clampEntriesToStock, mergeCartLines } from '../cart/mergeCartLines'
import { loadCartItems, saveCartItems } from '../cart/cartStorage'
import { CartContext } from './cart-context'

export function CartProvider({ children }) {
  const [entries, setEntries] = useState(() => loadCartItems())
  const [products, setProducts] = useState([])
  const [syncing, setSyncing] = useState(false)
  const [lastAddedId, setLastAddedId] = useState(null)
  const entriesRef = useRef(entries)

  useEffect(() => {
    entriesRef.current = entries
  }, [entries])

  const applyCatalog = useCallback((list) => {
    setProducts(list)
    setEntries((prev) => {
      const clamped = clampEntriesToStock(prev, list)
      const same =
        clamped.length === prev.length &&
        clamped.every(
          (c, i) =>
            c.productId === prev[i]?.productId && c.quantity === prev[i]?.quantity,
        )
      return same ? prev : clamped
    })
  }, [])

  const refreshCartProducts = useCallback(async () => {
    if (entriesRef.current.length === 0) {
      setProducts([])
      return
    }
    setSyncing(true)
    try {
      const list = await getAllProducts()
      applyCatalog(list)
    } catch {
      /* keep last known products on network error */
    } finally {
      setSyncing(false)
    }
  }, [applyCatalog])

  useEffect(() => {
    saveCartItems(entries)
  }, [entries])

  useEffect(() => {
    let cancelled = false

    async function syncOnEntriesChange() {
      if (entries.length === 0) {
        if (!cancelled) setProducts([])
        return
      }
      if (!cancelled) setSyncing(true)
      try {
        const list = await getAllProducts()
        if (!cancelled) applyCatalog(list)
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setSyncing(false)
      }
    }

    syncOnEntriesChange()
    return () => {
      cancelled = true
    }
  }, [entries.length, applyCatalog])

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible' && entriesRef.current.length > 0) {
        void refreshCartProducts()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refreshCartProducts])

  useEffect(() => {
    if (!lastAddedId) return undefined
    const t = setTimeout(() => setLastAddedId(null), 2000)
    return () => clearTimeout(t)
  }, [lastAddedId])

  const items = useMemo(
    () => mergeCartLines(entries, products),
    [entries, products],
  )

  const addToCart = useCallback((product, quantity = 1) => {
    if (!product?._id || product.stockQuantity < 1) return false

    const qtyToAdd = Math.max(1, Math.floor(quantity))
    let added = false

    setEntries((prev) => {
      const index = prev.findIndex((line) => line.productId === product._id)
      if (index === -1) {
        added = true
        return [
          ...prev,
          {
            productId: product._id,
            quantity: Math.min(qtyToAdd, product.stockQuantity),
          },
        ]
      }

      const max = product.stockQuantity
      const newQty = Math.min(prev[index].quantity + qtyToAdd, max)
      if (newQty === prev[index].quantity) return prev
      added = true
      const next = [...prev]
      next[index] = { productId: product._id, quantity: newQty }
      return next
    })

    if (added) {
      setLastAddedId(product._id)
      setProducts((prev) => {
        const idx = prev.findIndex((p) => p._id === product._id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = product
          return next
        }
        return [...prev, product]
      })
    }
    return added
  }, [])

  const removeFromCart = useCallback((productId) => {
    setEntries((prev) => prev.filter((line) => line.productId !== productId))
  }, [])

  const updateQuantity = useCallback(
    (productId, quantity) => {
      setEntries((prev) =>
        prev.map((line) => {
          if (line.productId !== productId) return line
          const live = products.find((p) => p._id === productId)
          const max = live?.stockQuantity ?? line.quantity
          const qty = Math.min(Math.max(1, Math.floor(quantity)), max)
          return { productId, quantity: qty }
        }),
      )
    },
    [products],
  )

  const clearCart = useCallback(() => {
    setEntries([])
    setProducts([])
  }, [])

  const cartCount = useMemo(
    () => items.reduce((sum, line) => sum + line.quantity, 0),
    [items],
  )

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, line) =>
          line.unavailable ? sum : sum + line.sellingPrice * line.quantity,
        0,
      ),
    [items],
  )

  const hasUnavailable = useMemo(
    () => items.some((line) => line.unavailable),
    [items],
  )

  const cartLoading = syncing && entries.length > 0 && products.length === 0

  const value = useMemo(
    () => ({
      items,
      entries,
      cartCount,
      subtotal,
      syncing,
      cartLoading,
      hasUnavailable,
      lastAddedId,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      refreshCartProducts,
      applyCatalog,
    }),
    [
      items,
      entries,
      cartCount,
      subtotal,
      syncing,
      cartLoading,
      hasUnavailable,
      lastAddedId,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      refreshCartProducts,
      applyCatalog,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
