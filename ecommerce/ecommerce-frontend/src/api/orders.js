import { fetchAuthList, fetchWithAuth } from './client'

export function createOrder(body) {
  return fetchWithAuth('/order/create-order', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function getMyOrders() {
  return fetchAuthList('/order/get-all-orders-for-user', 'orders')
}

export function getOrderById(id) {
  return fetchWithAuth(`/order/get-order/${id}`)
}

export function getAdminOrders() {
  return fetchAuthList('/order/get-all-orders', 'orders')
}

export function updateOrderStatus(id, status) {
  return fetchWithAuth(`/order/update-order-status/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}
