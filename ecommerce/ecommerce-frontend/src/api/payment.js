import { fetchWithAuth } from './client'

export function createRazorpayOrder({ items }) {
  return fetchWithAuth('/payment/create-razorpay-order', {
    method: 'POST',
    body: JSON.stringify({ items }),
  })
}

export function verifyRazorpayCheckout(body) {
  return fetchWithAuth('/payment/verify-razorpay-checkout', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
