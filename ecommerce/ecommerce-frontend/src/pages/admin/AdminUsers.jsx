import { useCallback, useEffect, useState } from 'react'
import { getAllUsers } from '../../api/admin'
import '../../components/admin/AdminPage.css'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setUsers(await getAllUsers())
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
        const list = await getAllUsers()
        if (!cancelled) setUsers(list)
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

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <div>
          <h1>Customers</h1>
          <p>Registered shoppers on LuxeMart (admin accounts are not listed).</p>
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

      <div className="admin-panel">
        {loading ? (
          <div className="admin-empty">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="admin-empty">No customer accounts yet.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber || '—'}</td>
                    <td>{formatDate(user.createdAt)}</td>
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
