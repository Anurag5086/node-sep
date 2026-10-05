import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyOrders } from '../api/orders'
import StoreHeader from '../components/StoreHeader'
import { formatPrice } from '../utils/format'
import { ORDER_STATUS_LABELS, formatOrderDate } from '../utils/order'
import './Orders.css'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const list = await getMyOrders()
        if (!cancelled) setOrders(list)
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
  }, [])

  return (
    <div className="orders-page">
      <StoreHeader />

      <main className="orders-main">
        <div className="orders-head">
          <h1>Your orders</h1>
          <p>Track status and details for every purchase.</p>
        </div>

        {error && (
          <div className="orders-alert orders-alert--error" role="alert">
            {error}
          </div>
        )}

        {loading && <p className="orders-muted">Loading orders…</p>}

        {!loading && orders.length === 0 && (
          <div className="orders-empty">
            <p>You haven&apos;t placed any orders yet.</p>
            <Link to="/">Start shopping</Link>
          </div>
        )}

        <ul className="orders-list">
          {orders.map((order) => (
            <li key={order._id}>
              <Link to={`/orders/${order._id}`} className="order-row">
                <div>
                  <p className="order-row__id">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="orders-muted">{formatOrderDate(order.createdAt)}</p>
                </div>
                <div className="order-row__meta">
                  <span className={`order-status order-status--${order.status}`}>
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </span>
                  <span className="order-row__total">{formatPrice(order.totalAmount)}</span>
                  <span className="order-row__payment">
                    {order.paymentMethod === 'COD' ? 'COD' : order.paymentMethod}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
