import { useCallback, useEffect, useState } from 'react'
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  updateCategory,
} from '../../api/admin'
import '../../components/admin/AdminPage.css'

const emptyForm = { title: '', description: '', isActive: true }

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setCategories(await getAdminCategories())
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
        const list = await getAdminCategories()
        if (!cancelled) setCategories(list)
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

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(category) {
    setEditingId(category._id)
    setForm({
      title: category.title ?? '',
      description: category.description ?? '',
      isActive: category.isActive !== false,
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        isActive: form.isActive,
      }
      if (editingId) {
        await updateCategory(editingId, payload)
        setSuccess('Category updated.')
      } else {
        await createCategory({
          title: payload.title,
          description: payload.description,
        })
        setSuccess('Category created.')
      }
      closeModal()
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(category) {
    if (!window.confirm(`Delete category “${category.title}”?`)) return
    setError('')
    setSuccess('')
    try {
      await deleteCategory(category._id)
      setSuccess('Category deleted.')
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <div>
          <h1>Categories</h1>
          <p>Create and manage product categories for the storefront.</p>
        </div>
        <div className="admin-actions">
          <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
            Add category
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
          <div className="admin-empty">Loading categories…</div>
        ) : categories.length === 0 ? (
          <div className="admin-empty">No categories yet. Add your first one.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id}>
                    <td>{cat.title}</td>
                    <td>{cat.description || '—'}</td>
                    <td>
                      <span
                        className={`admin-badge ${cat.isActive !== false ? 'admin-badge--on' : 'admin-badge--off'}`}
                      >
                        {cat.isActive !== false ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost admin-btn--sm"
                          onClick={() => openEdit(cat)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger admin-btn--sm"
                          onClick={() => handleDelete(cat)}
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
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="category-modal-title">
              {editingId ? 'Edit category' : 'New category'}
            </h2>
            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="cat-title">Title</label>
                <input
                  id="cat-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  minLength={3}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="cat-desc">Description</label>
                <textarea
                  id="cat-desc"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  maxLength={500}
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
