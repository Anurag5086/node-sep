import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/auth'
import AuthLayout from '../components/AuthLayout'
import './AuthForm.css'

export default function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()

    if (trimmedName.length < 2) {
      setError('Please enter your full name (at least 2 characters).')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await registerUser({
        name: trimmedName,
        email: trimmedEmail,
        password,
      })
      navigate('/login', {
        replace: true,
        state: {
          registered: 'Account created! Sign in to start shopping.',
        },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join LuxeMart for faster checkout, order history, and early access to sales."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="auth-alert auth-alert--error" role="alert">
            {error}
          </div>
        )}

        <div className="field">
          <label htmlFor="register-name">Full name</label>
          <input
            id="register-name"
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={2}
            maxLength={50}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="register-email">Email address</label>
          <input
            id="register-email"
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
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="new-password"
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

        <div className="field">
          <label htmlFor="register-confirm">Confirm password</label>
          <input
            id="register-confirm"
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
