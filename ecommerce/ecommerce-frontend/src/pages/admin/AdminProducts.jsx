import { useCallback, useEffect, useState } from 'react'
import {
  createProduct,
  deleteProduct,
  getAdminCategories,
  getAdminProducts,
  updateProduct,
} from '../../api/admin'
import { formatPrice } from '../../utils/format'
import '../../components/admin/AdminPage.css'

function emptyProductForm(categoryId = '') {
  return {
    title: '',
    description: '',
    brand: '',
    categoryId,
    mrpPrice: '',
    sellingPrice: '',
    stockQuantity: '',
    rating: '0',
    noOfRating: '0',
    imagesText: '',
    isActive: true,
  }
}

function productToForm(product) {
  const categoryId =
    typeof product.categoryId === 'object'
      ? product.categoryId?._id ?? ''
      : product.categoryId ?? ''
  return {
    title: product.title ?? '',
    description: product.description ?? '',
    brand: product.brand ?? '',
    categoryId,
    mrpPrice: String(product.mrpPrice ?? ''),
    sellingPrice: String(product.sellingPrice ?? ''),
    stockQuantity: String(product.stockQuantity ?? ''),
    rating: String(product.rating ?? 0),
    noOfRating: String(product.noOfRating ?? 0),
    imagesText: (product.images ?? []).join(', '),
    isActive: product.isActive !== false,
  }
}

function formToPayload(form) {
  const images = form.imagesText
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    brand: form.brand.trim(),
    categoryId: form.categoryId,
    mrpPrice: Number(form.mrpPrice),
    sellingPrice: Number(form.sellingPrice),
    stockQuantity: Number(form.stockQuantity),
    rating: Number(form.rating) || 0,
    noOfRating: Number(form.noOfRating) || 0,
    images,
    isActive: form.isActive,
  }
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyProductForm())
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [productList, categoryList] = await Promise.all([
        getAdminProducts(),
        getAdminCategories(),
      ])
      setProducts(productList)
      setCategories(categoryList)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      setLoading(true)
      setError('')
      try {
        const [productList, categoryList] = await Promise.all([
          getAdminProducts(),
          getAdminCategories(),
        ])
        if (!cancelled) {
          setProducts(productList)
          setCategories(categoryList)
        }
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

  function categoryLabel(product) {
    const c = product.categoryId
    if (c && typeof c === 'object') return c.title ?? '—'
    const found = categories.find((x) => x._id === c)
    return found?.title ?? '—'
  }

  function openCreate() {
    const defaultCat = categories[0]?._id ?? ''
    setEditingId(null)
    setForm(emptyProductForm(defaultCat))
    setModalOpen(true)
  }

  function openEdit(product) {
    setEditingId(product._id)
    setForm(productToForm(product))
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const payload = formToPayload(form)
      if (editingId) {
        await updateProduct(editingId, payload)
        setSuccess('Product updated.')
      } else {
        await createProduct(payload)
        setSuccess('Product created.')
      }
      closeModal()
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete product “${product.title}”?`)) return
    setError('')
    setSuccess('')
    try {
      await deleteProduct(product._id)
      setSuccess('Product deleted.')
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <div>
          <h1>Products</h1>
          <p>Manage catalog items, pricing, inventory, and visibility.</p>
        </div>
        <div className="admin-actions">
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={openCreate}
            disabled={categories.length === 0}
          >
            Add product
          </button>
        </div>
      </div>

      {categories.length === 0 && !loading && (
        <div className="admin-alert admin-alert--error" role="alert">
          Create at least one category before adding products.
        </div>
      )}

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
          <div className="admin-empty">Loading products…</div>
        ) : products.length === 0 ? (
          <div className="admin-empty">No products yet.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <strong>{product.title}</strong>
                      <br />
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {product.brand}
                      </span>
                    </td>
                    <td>{categoryLabel(product)}</td>
                    <td>{formatPrice(product.sellingPrice)}</td>
                    <td>{product.stockQuantity}</td>
                    <td>
                      <span
                        className={`admin-badge ${product.isActive !== false ? 'admin-badge--on' : 'admin-badge--off'}`}
                      >
                        {product.isActive !== false ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost admin-btn--sm"
                          onClick={() => openEdit(product)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger admin-btn--sm"
                          onClick={() => handleDelete(product)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="admin-modal-backdrop" role="presentation" onClick={closeModal}>
          <div
            className="admin-modal admin-modal--wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="product-modal-title">
              {editingId ? 'Edit product' : 'New product'}
            </h2>
            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="prod-title">Title</label>
                <input
                  id="prod-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  minLength={3}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="prod-desc">Description</label>
                <textarea
                  id="prod-desc"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  maxLength={1000}
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="prod-brand">Brand</label>
                  <input
                    id="prod-brand"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="prod-category">Category</label>
                  <select
                    id="prod-category"
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    required
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="prod-mrp">MRP (₹)</label>
                  <input
                    id="prod-mrp"
                    type="number"
                    min="0"
                    step="1"
                    value={form.mrpPrice}
                    onChange={(e) => setForm({ ...form, mrpPrice: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="prod-sell">Selling price (₹)</label>
                  <input
                    id="prod-sell"
                    type="number"
                    min="0"
                    step="1"
                    value={form.sellingPrice}
                    onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="prod-stock">Stock quantity</label>
                  <input
                    id="prod-stock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stockQuantity}
                    onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="prod-rating">Rating (0–5)</label>
                  <input
                    id="prod-rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="prod-images">Image URLs (comma-separated)</label>
                <textarea
                  id="prod-images"
                  value={form.imagesText}
                  onChange={(e) => setForm({ ...form, imagesText: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {editingId && (
                <label className="admin-form__checks">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  Visible on storefront
                </label>
              )}
              <div className="admin-form__foot">
                <button type="button" className="admin-btn admin-btn--ghost" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                  {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
