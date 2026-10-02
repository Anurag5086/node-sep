import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './AdminRoute.css'

export default function AdminRoute() {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner" aria-hidden="true" />
        <p>Checking access…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!isAdmin) {
    return (
      <div className="admin-denied">
        <h1>Access denied</h1>
        <p>This area is for store administrators only.</p>
        <a href="/">Return to storefront</a>
      </div>
    )
  }

  return <Outlet />
}
