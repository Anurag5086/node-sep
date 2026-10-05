import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getAllProducts } from '../api/catalog'
import * as paymentApi from '../api/payment'
import { createOrder } from '../api/orders'
import { updateUserProfile } from '../api/user'
import StoreHeader from '../components/StoreHeader'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../utils/format'
import { loadRazorpayScript } from '../utils/razorpay'
import './Checkout.css'

export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    items,
    subtotal,
    clearCart,
    hasUnavailable,
    applyCatalog,
  } = useCart()
  const location = useLocation()

  const [phoneNumber, setPhoneNumber] = useState(() => user?.phoneNumber ?? '')
  const [address, setAddress] = useState(() => user?.address ?? '')
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (location.pathname !== '/checkout') return undefined
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

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart', { replace: true })
    } else if (hasUnavailable) {
      navigate('/cart', { replace: true })
    }
  }, [items.length, hasUnavailable, navigate])

  function buildCartPayload() {
    return items.map((line) => ({
      product: line.productId,
      quantity: line.quantity,
    }))
  }

  function buildShippingAddress(phone) {
    return `${user?.name}\nPhone: ${phone}\n${address.trim()}`
  }

  function validateAddress() {
    const phone = phoneNumber.trim()
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      setError('Enter a valid 10-digit phone number.')
      return null
    }
    if (address.trim().length < 10) {
      setError('Please enter a complete delivery address.')
      return null
    }
    setError('')
    return phone
  }

  async function saveProfileIfNeeded(phone) {
    await updateUserProfile({
      name: user.name,
      phoneNumber: phone,
      address: address.trim(),
    }).catch(() => {})
  }

  async function handleCodSubmit(e) {
    e.preventDefault()
    const phone = validateAddress()
    if (!phone) return

    setLoading(true)
    setError('')

    try {
      await saveProfileIfNeeded(phone)

      const data = await createOrder({
        products: buildCartPayload(),
        totalAmount: subtotal,
        paymentMethod: 'COD',
        shippingAddress: buildShippingAddress(phone),
      })

      clearCart()
      navigate(`/orders/${data.order._id}`, {
        replace: true,
        state: { placed: true, paymentMethod: 'COD' },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRazorpay() {
    const phone = validateAddress()
    if (!phone) return

    setLoading(true)
    setError('')

    const cartPayload = buildCartPayload()
    const shippingAddress = buildShippingAddress(phone)

    try {
      await saveProfileIfNeeded(phone)

      const rp = await paymentApi.createRazorpayOrder({ items: cartPayload })
      const RazorpayCtor = await loadRazorpayScript()

      await new Promise((resolve, reject) => {
        const options = {
          key: rp.keyId,
          amount: rp.amount,
          currency: rp.currency || 'INR',
          order_id: rp.orderId,
          name: 'LuxeMart',
          description: 'Order payment',
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: phone,
          },
          handler: async (response) => {
            try {
              const result = await paymentApi.verifyRazorpayCheckout({
                items: cartPayload,
                shippingAddress,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
              clearCart()
              navigate(`/orders/${result.order._id}`, {
                replace: true,
                state: { placed: true, paymentMethod: 'Razorpay' },
              })
              resolve()
            } catch (err) {
              reject(err)
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled')),
          },
          theme: { color: '#c25c3e' },
        }

        const rz = new RazorpayCtor(options)
        rz.on('payment.failed', () => reject(new Error('Payment failed')))
        rz.open()
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment error'
      if (!message.includes('cancelled')) {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  function handlePlaceOrder(e) {
    e.preventDefault()
    if (paymentMethod === 'Razorpay') {
      handleRazorpay()
    } else {
      handleCodSubmit(e)
    }
  }

  if (items.length === 0) return null

  const submitLabel =
    paymentMethod === 'Razorpay'
      ? loading
        ? 'Opening payment…'
        : `Pay with Razorpay · ${formatPrice(subtotal)}`
      : loading
        ? 'Placing order…'
        : `Place COD order · ${formatPrice(subtotal)}`

  return (
    <div className="checkout-page">
      <StoreHeader />

      <main className="checkout-main">
        <div className="checkout-head">
          <h1>Checkout</h1>
          <p>Choose cash on delivery or pay securely with Razorpay.</p>
        </div>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handlePlaceOrder}>
            {error && (
              <div className="checkout-alert checkout-alert--error" role="alert">
                {error}
              </div>
            )}

            <section className="checkout-section">
              <h2>Contact</h2>
              <p className="checkout-muted">{user?.email}</p>
            </section>

            <section className="checkout-section">
              <h2>Delivery address</h2>
              <div className="checkout-field">
                <label htmlFor="checkout-phone">Phone number</label>
                <input
                  id="checkout-phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile number"
                  required
                />
              </div>
              <div className="checkout-field">
                <label htmlFor="checkout-address">Full address</label>
                <textarea
                  id="checkout-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House no., street, city, state, PIN code"
                  rows={4}
                  required
                />
              </div>
            </section>

            <section className="checkout-section">
              <h2>Payment</h2>
              <div className="checkout-payments">
                <label
                  className={`checkout-payment${paymentMethod === 'COD' ? ' checkout-payment--active' : ''}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <span>
                    <strong>Cash on Delivery (COD)</strong>
                    <small>Pay in cash when the order is delivered.</small>
                  </span>
                </label>
                <label
                  className={`checkout-payment${paymentMethod === 'Razorpay' ? ' checkout-payment--active' : ''}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="Razorpay"
                    checked={paymentMethod === 'Razorpay'}
                    onChange={() => setPaymentMethod('Razorpay')}
                  />
                  <span>
                    <strong>Razorpay (UPI / Card / Netbanking)</strong>
                    <small>Pay now via secure Razorpay checkout.</small>
                  </span>
                </label>
              </div>
            </section>

            <button type="submit" className="checkout-submit" disabled={loading}>
              {submitLabel}
            </button>
            <Link to="/cart" className="checkout-back">
              ← Back to bag
            </Link>
          </form>

          <aside className="checkout-summary">
            <h2>Your items ({items.length})</h2>
            <ul className="checkout-lines">
              {items.map((line) => (
                <li key={line.productId}>
                  <span className="checkout-lines__qty">{line.quantity}×</span>
                  <span className="checkout-lines__title">{line.title}</span>
                  <span className="checkout-lines__price">
                    {formatPrice(line.sellingPrice * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="checkout-summary__total">
              <span>Total</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
