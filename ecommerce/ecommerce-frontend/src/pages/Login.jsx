import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginUser } from '../api/auth'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../hooks/useAuth'
import './AuthForm.css'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser, refreshUser } = useAuth()
  const registeredMessage = location.state?.registered
  const redirectTo = location.state?.from

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginUser({ email: email.trim(), password })
      if (data.user) {
        setUser(data.user)
      } else {
        await refreshUser()
      }
      const role = data.user?.role
      if (redirectTo?.startsWith('/admin') && role === 'admin') {
        navigate(redirectTo, { replace: true })
      } else if (role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/', { replace: true, state: { loggedIn: true } })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to track orders, wishlists, and exclusive member deals."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {registeredMessage && (
          <div className="auth-alert auth-alert--success" role="status">
            {registeredMessage}
          </div>
        )}
        {error && (
          <div className="auth-alert auth-alert--error" role="alert">
            {error}
          </div>
        )}

        <div className="field">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field field--password">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className="auth-meta">
          <label>
            <input type="checkbox" name="remember" />
            Remember me
          </label>
          <a href="#reset">Forgot password?</a>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="auth-divider">or</div>

        <p className="auth-switch">
          New to LuxeMart? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
