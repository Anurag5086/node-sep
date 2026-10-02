import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  getAllCategories,
  getAllProducts,
  getProductsByCategory,
} from '../api/catalog'
import ProductGrid from '../components/ProductGrid'
import StoreHeader from '../components/StoreHeader'
import { productCategoryId } from '../utils/format'
import heroImg from '../assets/hero.png'
import './Home.css'

export default function Home() {
  const location = useLocation()
  const justLoggedIn = location.state?.loggedIn

  const [categories, setCategories] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const [error, setError] = useState('')

  const loadProducts = useCallback(async (categoryId) => {
    setProductsLoading(true)
    setError('')
    try {
      const list = categoryId
        ? await getProductsByCategory(categoryId)
        : await getAllProducts()
      setProducts(list)
      if (!categoryId) setAllProducts(list)
    } catch (err) {
      setError(err.message)
      setProducts([])
    } finally {
      setProductsLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      setLoading(true)
      setError('')
      try {
        const [categoryList, productList] = await Promise.all([
          getAllCategories(),
          getAllProducts(),
        ])
        if (cancelled) return
        setCategories(categoryList)
        setAllProducts(productList)
        setProducts(productList)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])

  function handleCategorySelect(categoryId) {
    setSelectedCategoryId(categoryId)
    loadProducts(categoryId)
  }

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => {
      const haystack = `${p.title} ${p.brand} ${p.description ?? ''}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [products, searchQuery])

  const sectionTitle = selectedCategoryId
    ? categories.find((c) => c._id === selectedCategoryId)?.title ?? 'Collection'
    : 'Trending now'

  return (
    <div className="store">
      <StoreHeader searchValue={searchQuery} onSearchChange={setSearchQuery} />

      {justLoggedIn && (
        <p className="store-toast" role="status">
          Welcome back — happy shopping!
        </p>
      )}

      {error && (
        <div className="store-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => loadProducts(selectedCategoryId)}>
            Try again
          </button>
        </div>
      )}

      <section className="store-hero">
        <div className="store-hero__copy">
          <p className="store-hero__eyebrow">New season · Members save more</p>
          <h1>Elevated essentials for everyday luxury</h1>
          <p className="store-hero__lead">
            Hand-picked styles across {categories.length || 'top'} categories —
            quality you can feel, prices you&apos;ll love.
          </p>
          <div className="store-hero__actions">
            <a href="#shop" className="store-hero__btn store-hero__btn--primary">
              Shop collection
            </a>
            <Link to="/register" className="store-hero__btn store-hero__btn--ghost">
              Join &amp; save 10%
            </Link>
          </div>
        </div>
        <div className="store-hero__visual">
          <img src={heroImg} alt="Seasonal fashion collection" />
        </div>
      </section>

      <section className="store-trust" aria-label="Store benefits">
        <div>
          <strong>Free delivery</strong>
          <span>On orders ₹999+</span>
        </div>
        <div>
          <strong>Easy returns</strong>
          <span>30-day policy</span>
        </div>
        <div>
          <strong>Secure checkout</strong>
          <span>Trusted payments</span>
        </div>
        <div>
          <strong>24/7 support</strong>
          <span>We&apos;re here to help</span>
        </div>
      </section>

      <section className="store-categories" aria-labelledby="categories-heading">
        <div className="store-section-head">
          <h2 id="categories-heading">Shop by category</h2>
          <p>Browse curated edits for every mood and moment.</p>
        </div>

        {loading ? (
          <div className="category-row category-row--loading" aria-busy="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="category-chip-skeleton" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="store-muted">Categories will appear here once added.</p>
        ) : (
          <div className="category-row">
            <button
              type="button"
              className={`category-chip ${selectedCategoryId === null ? 'is-active' : ''}`}
              onClick={() => handleCategorySelect(null)}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                type="button"
                className={`category-chip ${selectedCategoryId === category._id ? 'is-active' : ''}`}
                onClick={() => handleCategorySelect(category._id)}
              >
                {category.title}
              </button>
            ))}
          </div>
        )}

        {!loading && categories.length > 0 && (
          <ul className="category-cards">
            {categories.slice(0, 4).map((category, index) => {
              const count = allProducts.filter(
                (p) => productCategoryId(p) === category._id,
              ).length
              return (
                <li key={category._id}>
                  <button
                    type="button"
                    className="category-card"
                    onClick={() => handleCategorySelect(category._id)}
                  >
                    <span className="category-card__index">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="category-card__title">{category.title}</span>
                    <span className="category-card__desc">
                      {category.description || 'Explore the latest picks'}
                    </span>
                    <span className="category-card__meta">
                      {count > 0 ? `${count} items` : 'Shop now'}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section id="shop" className="store-products" aria-labelledby="products-heading">
        <div className="store-section-head store-section-head--row">
          <div>
            <h2 id="products-heading">{sectionTitle}</h2>
            <p>
              {filteredProducts.length}{' '}
              {filteredProducts.length === 1 ? 'product' : 'products'}
              {searchQuery.trim() ? ` matching “${searchQuery.trim()}”` : ''}
            </p>
          </div>
          {selectedCategoryId && (
            <button
              type="button"
              className="store-clear-filter"
              onClick={() => handleCategorySelect(null)}
            >
              Clear filter
            </button>
          )}
        </div>

        <ProductGrid
          products={filteredProducts}
          loading={loading || productsLoading}
        />
      </section>

      <footer className="store-footer">
        <div className="store-footer__brand">
          <span className="brand">
            <span className="brand__mark" aria-hidden="true">
              ◆
            </span>
            LuxeMart
          </span>
          <p>Curated commerce for modern shoppers.</p>
        </div>
        <div className="store-footer__cols">
          <div>
            <h3>Help</h3>
            <ul>
              <li>Shipping</li>
              <li>Returns</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h3>Account</h3>
            <ul>
              <li>
                <Link to="/login">Sign in</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="store-footer__copy">
          © {new Date().getFullYear()} LuxeMart. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
