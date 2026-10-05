import { useEffect, useState } from 'react'
import { getAdminOrders, updateOrderStatus } from '../../api/orders'
import { formatPrice } from '../../utils/format'
import { ORDER_STATUS_LABELS, formatOrderDate } from '../../utils/order'
import '../../components/admin/AdminPage.css'

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setOrders(await getAdminOrders())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function init() {
      setLoading(true)
      setError('')
      try {
        const list = await getAdminOrders()
        if (!cancelled) setOrders(list)
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

  async function handleStatusChange(orderId, status) {
    setSuccess('')
    setError('')
    try {
      await updateOrderStatus(orderId, status)
      setSuccess('Order status updated.')
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <div>
          <h1>Orders</h1>
          <p>Manage COD and online orders — update fulfillment status.</p>
        </div>
        <div className="admin-actions">
          <button type="button" className="admin-btn admin-btn--ghost" onClick={load}>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-alert admin-alert--error" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="admin-alert admin-alert--success" role="status">
          {success}
        </div>
      )}

      <div className="admin-panel">
        {loading ? (
          <div className="admin-empty">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="admin-empty">No orders yet.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Placed</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>#{order._id.slice(-8).toUpperCase()}</td>
                    <td>
                      {order.userId?.name ?? '—'}
                      <br />
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {order.userId?.email}
                      </span>
                    </td>
                    <td>{formatPrice(order.totalAmount)}</td>
                    <td>{order.paymentMethod}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        aria-label={`Status for order ${order._id}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {ORDER_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{formatOrderDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
