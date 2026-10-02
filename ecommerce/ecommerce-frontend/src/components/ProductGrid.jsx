import ProductCard from './ProductCard'
import './ProductGrid.css'

export default function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div className="product-grid product-grid--loading" aria-busy="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="product-skeleton" />
        ))}
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="product-empty">
        <p>No products in this collection yet.</p>
        <span>Check back soon or browse another category.</span>
      </div>
    )
  }

  return (
    <ul className="product-grid">
      {products.map((product) => (
        <li key={product._id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  )
}
