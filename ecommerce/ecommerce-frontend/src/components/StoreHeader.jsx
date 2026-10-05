import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import './StoreHeader.css'

export default function StoreHeader({ searchValue = '', onSearchChange }) {
  const { user, isAdmin, isLoggedIn, logout } = useAuth()
  const { cartCount } = useCart()
  return (
    <>
      <div className="promo-bar">
        Free shipping on orders over ₹999 · Easy 30-day returns
      </div>
      <header className="store-header">
        <Link to="/" className="brand">
          <span className="brand__mark" aria-hidden="true">
            ◆
          </span>
          LuxeMart
        </Link>

        <form
          className="store-search"
          role="search"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="store-search-input" className="visually-hidden">
            Search products
          </label>
          <input
            id="store-search-input"
            type="search"
            placeholder="Search for brands, products and more"
            autoComplete="off"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
          <button type="submit" aria-label="Search">
            <SearchIcon />
          </button>
        </form>

        <nav className="store-nav" aria-label="Account">
          {isAdmin && (
            <Link to="/admin" className="store-nav__item">
              <AdminIcon />
              <span>Admin</span>
            </Link>
          )}
          {isLoggedIn ? (
            <>
              <Link to="/orders" className="store-nav__item">
                <OrdersIcon />
                <span>Orders</span>
              </Link>
              <span className="store-nav__greeting" title={user?.email}>
                Hi, {user?.name?.split(' ')[0] ?? 'there'}
              </span>
              <button type="button" className="store-nav__item" onClick={logout}>
                <UserIcon />
                <span>Sign out</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="store-nav__item">
              <UserIcon />
              <span>Sign in</span>
            </Link>
          )}
          <Link to="/cart" className="store-nav__item store-nav__cart">
            <CartIcon />
            <span>Bag</span>
            {cartCount > 0 && (
              <span className="store-nav__badge" aria-label={`${cartCount} items in bag`}>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
        </nav>
      </header>
    </>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 20l-3-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function OrdersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 7h14l-1.5 9H8.5L7 7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M4 4h2v2H4V4z" fill="currentColor" />
    </svg>
  )
}

function AdminIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 20c0-4 3.5-6 7-6s7 2 7 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6h15l-1.5 9h-12L6 6z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="19" r="1.5" fill="currentColor" />
      <circle cx="17" cy="19" r="1.5" fill="currentColor" />
    </svg>
  )
}
