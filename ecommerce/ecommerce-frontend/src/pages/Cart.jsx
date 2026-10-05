import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getAllProducts } from '../api/catalog'
import StoreHeader from '../components/StoreHeader'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/format'
import './Cart.css'

export default function Cart() {
  const { isLoggedIn } = useAuth()
  const {
    items,
    cartCount,
    subtotal,
    cartLoading,
    hasUnavailable,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCatalog,
  } = useCart()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname !== '/cart') return undefined
    let cancelled = false

    async function refreshForPage() {
      try {
        const list = await getAllProducts()
        if (!cancelled) applyCatalog(list)
      } catch {
        /* ignore */
      }
    }

    refreshForPage()
    return () => {
      cancelled = true
    }
  }, [location.pathname, applyCatalog])

  return (
    <div className="cart-page">
      <StoreHeader />

      <main className="cart-main">
        <div className="cart-head">
          <h1>Your bag</h1>
          <p>
            {cartCount === 0
              ? 'Your bag is empty.'
              : `${cartCount} item${cartCount === 1 ? '' : 's'} in your bag`}
          </p>
        </div>

        {cartLoading ? (
          <div className="cart-empty">
            <p>Updating your bag with the latest prices and details…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="cart-empty">
            <p>Looks like you haven&apos;t added anything yet.</p>
            <Link to="/" className="cart-empty__cta">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <ul className="cart-lines">
              {items.map((line) => (
                <li
                  key={line.productId}
                  className={`cart-line${line.unavailable ? ' cart-line--unavailable' : ''}`}
                >
                  <div className="cart-line__media">
                    {line.image ? (
                      <img src={line.image} alt="" />
                    ) : (
                      <span className="cart-line__placeholder">
                        {line.brand?.charAt(0) ?? 'L'}
                      </span>
                    )}
                  </div>

                  <div className="cart-line__info">
                    <p className="cart-line__brand">{line.brand}</p>
                    <h2 className="cart-line__title">{line.title}</h2>
                    {line.unavailable && (
                      <p className="cart-line__warn">
                        This item is no longer available. Remove it to continue.
                      </p>
                    )}
                    <p className="cart-line__price">
                      {formatPrice(line.sellingPrice)}
                      {line.mrpPrice > line.sellingPrice && (
                        <span className="cart-line__mrp">
                          {formatPrice(line.mrpPrice)}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="cart-line__actions">
                    <div className="qty-control" aria-label="Quantity">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(line.productId, line.quantity - 1)
                        }
                        disabled={line.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(line.productId, line.quantity + 1)
                        }
                        disabled={line.unavailable || line.quantity >= line.stockQuantity}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <p className="cart-line__line-total">
                      {formatPrice(line.sellingPrice * line.quantity)}
                    </p>
                    <button
                      type="button"
                      className="cart-line__remove"
                      onClick={() => removeFromCart(line.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="cart-summary">
              <h2>Order summary</h2>
              <div className="cart-summary__row">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <p className="cart-summary__note">
                Shipping and taxes calculated at checkout.
              </p>
              {hasUnavailable && (
                <p className="cart-summary__warn">
                  Remove unavailable items before checkout.
                </p>
              )}
              {isLoggedIn ? (
                <Link
                  to="/checkout"
                  className={`cart-summary__checkout cart-summary__checkout--active${hasUnavailable ? ' cart-summary__checkout--disabled' : ''}`}
                  aria-disabled={hasUnavailable}
                  onClick={(e) => hasUnavailable && e.preventDefault()}
                >
                  Proceed to checkout
                </Link>
              ) : (
                <Link
                  to="/login"
                  state={{ from: '/checkout' }}
                  className="cart-summary__checkout cart-summary__checkout--active"
                >
                  Sign in to checkout
                </Link>
              )}
              <button type="button" className="cart-summary__clear" onClick={clearCart}>
                Clear bag
              </button>
              <Link to="/" className="cart-summary__continue">
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
