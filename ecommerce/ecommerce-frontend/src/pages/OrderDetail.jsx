import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getOrderById } from '../api/orders'
import StoreHeader from '../components/StoreHeader'
import { formatPrice } from '../utils/format'
import {
  ORDER_STATUS_LABELS,
  formatOrderDate,
  orderLineTitle,
} from '../utils/order'
import './Orders.css'

export default function OrderDetail() {
  const { orderId } = useParams()
  const location = useLocation()
  const justPlaced = location.state?.placed || location.state?.success
  const placedPayment = location.state?.paymentMethod

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await getOrderById(orderId)
        if (!cancelled) setOrder(data.order)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [orderId])

  return (
    <div className="orders-page">
      <StoreHeader />

      <main className="orders-main orders-main--narrow">
        {loading && <p className="orders-muted">Loading order…</p>}
        {error && (
          <div className="orders-alert orders-alert--error" role="alert">
            {error}
          </div>
        )}

        {order && (
          <>
            {justPlaced && (
              <div className="orders-success-banner" role="status">
                <h2>Order placed successfully!</h2>
                <p>
                  {placedPayment === 'Razorpay'
                    ? 'Payment received via Razorpay. We’ll ship your order soon.'
                    : 'Your COD order is confirmed. We’ll contact you before delivery.'}
                </p>
              </div>
            )}

            <div className="order-detail-head">
              <div>
                <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>
                <p className="orders-muted">Placed {formatOrderDate(order.createdAt)}</p>
              </div>
              <span className={`order-status order-status--${order.status}`}>
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>

            <div className="order-detail-grid">
              <section className="order-card">
                <h3>Items</h3>
                <ul className="order-items">
                  {order.products.map((line, i) => (
                    <li key={i}>
                      <span>{line.quantity}× {orderLineTitle(line)}</span>
                      <span>
                        {formatPrice(
                          (line.product?.sellingPrice ?? 0) * line.quantity,
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="order-total-row">
                  <span>Total</span>
                  <strong>{formatPrice(order.totalAmount)}</strong>
                </div>
              </section>

              <section className="order-card">
                <h3>Delivery &amp; payment</h3>
                <p className="order-meta">
                  <strong>Payment</strong>
                  <span>{order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}</span>
                </p>
                <p className="order-meta order-meta--address">
                  <strong>Ship to</strong>
                  <span style={{ whiteSpace: 'pre-line' }}>{order.shippingAddress}</span>
                </p>
              </section>
            </div>

            <div className="orders-actions">
              <Link to="/orders" className="orders-link-btn">
                View all orders
              </Link>
              <Link to="/" className="orders-link-btn orders-link-btn--ghost">
                Continue shopping
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
