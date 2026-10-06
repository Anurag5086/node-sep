import { useCart } from '../../hooks/useCart'
import {
  discountPercent,
  formatPrice,
  productImage,
} from '../../utils/format'
import './AssistantProductCard.css'

export default function AssistantProductCard({ product, compact }) {
  const { addToCart, lastAddedId } = useCart()
  const image = productImage(product)
  const discount = discountPercent(product.mrpPrice, product.sellingPrice)
  const inStock = product.stockQuantity > 0
  const justAdded = lastAddedId === product._id

  return (
    <article className={`assistant-product${compact ? ' assistant-product--compact' : ''}`}>
      <div className="assistant-product__shine" aria-hidden />
      <div className="assistant-product__media">
        {discount > 0 && (
          <span className="assistant-product__badge">-{discount}%</span>
        )}
        {image ? (
          <img src={image} alt="" loading="lazy" />
        ) : (
          <div className="assistant-product__placeholder">
            {product.brand?.charAt(0) ?? 'L'}
          </div>
        )}
      </div>
      <div className="assistant-product__body">
        <p className="assistant-product__brand">{product.brand}</p>
        <h4 className="assistant-product__title">{product.title}</h4>
        <div className="assistant-product__pricing">
          <span className="assistant-product__price">
            {formatPrice(product.sellingPrice)}
          </span>
          {product.mrpPrice > product.sellingPrice && (
            <span className="assistant-product__mrp">
              {formatPrice(product.mrpPrice)}
            </span>
          )}
        </div>
        {!inStock ? (
          <span className="assistant-product__stock assistant-product__stock--out">
            Out of stock
          </span>
        ) : (
          <button
            type="button"
            className={`assistant-product__add${justAdded ? ' assistant-product__add--done' : ''}`}
            onClick={() => addToCart(product)}
          >
            {justAdded ? (
              <>
                <span className="assistant-product__check" aria-hidden>
                  ✓
                </span>
                In your bag
              </>
            ) : (
              <>
                <BagIcon />
                Add to bag
              </>
            )}
          </button>
        )}
      </div>
    </article>
  )
}

function BagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 7h12l-1.2 12H7.2L6 7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9 7V5a3 3 0 0 1 6 0v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
