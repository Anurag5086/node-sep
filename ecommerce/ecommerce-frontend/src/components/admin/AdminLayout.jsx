import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './AdminLayout.css'

const NAV = [
  { to: '/admin/products', label: 'Products', end: false },
  { to: '/admin/categories', label: 'Categories', end: false },
  { to: '/admin/orders', label: 'Orders', end: false },
  { to: '/admin/users', label: 'Users', end: false },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-sidebar__brand">
          <span className="brand__mark" aria-hidden="true">
            ◆
          </span>
          LuxeMart
        </Link>
        <p className="admin-sidebar__role">Admin console</p>

        <nav className="admin-nav" aria-label="Admin">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `admin-nav__link${isActive ? ' is-active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__foot">
          <p className="admin-sidebar__user">{user?.name ?? user?.email}</p>
          <Link to="/" className="admin-sidebar__store">
            ← Back to store
          </Link>
          <button type="button" className="admin-sidebar__logout" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  )
}
