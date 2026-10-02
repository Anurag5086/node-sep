import { useCart } from '../hooks/useCart'
import {
  discountPercent,
  formatPrice,
  productImage,
} from '../utils/format'
import './ProductCard.css'

export default function ProductCard({ product }) {
  const { addToCart, lastAddedId } = useCart()
  const image = productImage(product)
  const discount = discountPercent(product.mrpPrice, product.sellingPrice)
  const inStock = product.stockQuantity > 0
  const justAdded = lastAddedId === product._id

  return (
    <article className="product-card">
      <div className="product-card__media">
        {discount > 0 && (
          <span className="product-card__badge">{discount}% OFF</span>
        )}
        {image ? (
          <img src={image} alt={product.title} loading="lazy" />
        ) : (
          <div className="product-card__placeholder" aria-hidden>
            <span>{product.brand?.charAt(0) ?? 'L'}</span>
          </div>
        )}
        <button type="button" className="product-card__wishlist" aria-label="Add to wishlist">
          ♡
        </button>
      </div>

      <div className="product-card__body">
        <p className="product-card__brand">{product.brand}</p>
        <h3 className="product-card__title">{product.title}</h3>

        <div className="product-card__rating" aria-label={`Rating ${product.rating} out of 5`}>
          <span className="product-card__stars">★</span>
          <span>{product.rating?.toFixed(1) ?? '0.0'}</span>
          {product.noOfRating > 0 && (
            <span className="product-card__reviews">({product.noOfRating})</span>
          )}
        </div>

        <div className="product-card__pricing">
          <span className="product-card__price">
            {formatPrice(product.sellingPrice)}
          </span>
          {product.mrpPrice > product.sellingPrice && (
            <span className="product-card__mrp">
              {formatPrice(product.mrpPrice)}
            </span>
          )}
        </div>

        <button
          type="button"
          className={`product-card__cta${justAdded ? ' product-card__cta--added' : ''}`}
          disabled={!inStock}
          onClick={() => addToCart(product)}
        >
          {!inStock ? 'Out of stock' : justAdded ? 'Added ✓' : 'Add to bag'}
        </button>
      </div>
    </article>
  )
}
