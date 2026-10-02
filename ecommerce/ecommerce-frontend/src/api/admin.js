import { fetchAuthList, fetchWithAuth } from './client'

export function getAdminCategories() {
  return fetchAuthList('/category/get-all-categories-admin', 'categories')
}

export function createCategory(body) {
  return fetchWithAuth('/category/create-category', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateCategory(id, body) {
  return fetchWithAuth(`/category/update-category/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function deleteCategory(id) {
  return fetchWithAuth(`/category/delete-category/${id}`, { method: 'DELETE' })
}

export function getAdminProducts() {
  return fetchAuthList('/product/get-all-products-admin', 'products')
}

export function createProduct(body) {
  return fetchWithAuth('/product/create-product', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateProduct(id, body) {
  return fetchWithAuth(`/product/update-product/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function deleteProduct(id) {
  return fetchWithAuth(`/product/delete-product/${id}`, { method: 'DELETE' })
}

export function getAllUsers() {
  return fetchAuthList('/user/get-all-users', 'users')
}
