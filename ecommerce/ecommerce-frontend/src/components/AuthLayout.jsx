import { Link } from 'react-router-dom'
import heroImg from '../assets/hero.png'
import './AuthLayout.css'

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <aside className="auth-visual" aria-hidden="true">
        <img src={heroImg} alt="" className="auth-visual__image" />
        <div className="auth-visual__overlay" />
        <div className="auth-visual__content">
          <p className="auth-visual__eyebrow">New season · Up to 40% off</p>
          <h2 className="auth-visual__headline">
            Curated styles for every moment
          </h2>
          <p className="auth-visual__copy">
            Free shipping on orders over ₹999 · Easy returns within 30 days
          </p>
        </div>
      </aside>

      <main className="auth-main">
        <header className="auth-header">
          <Link to="/" className="brand">
            <span className="brand__mark" aria-hidden="true">
              ◆
            </span>
            LuxeMart
          </Link>
        </header>

        <div className="auth-form-wrap">
          <div className="auth-form-intro">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {children}
        </div>

        <footer className="auth-footer">
          <p>© {new Date().getFullYear()} LuxeMart. All rights reserved.</p>
        </footer>
      </main>
    </div>
  )
}
