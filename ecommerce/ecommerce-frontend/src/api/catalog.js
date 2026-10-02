import { fetchList } from './client'

export function getAllCategories() {
  return fetchList('/category/get-all-categories', 'categories')
}

export function getAllProducts() {
  return fetchList('/product/get-all-products', 'products')
}

export function getProductsByCategory(categoryId) {
  return fetchList(
    `/product/get-all-products-for-category/${categoryId}`,
    'products',
  )
}
