import { useCallback, useEffect, useMemo, useState } from 'react'
import { logoutUser } from '../api/auth'
import { getCurrentUser } from '../api/user'
import { clearToken, getToken } from '../api/token'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      return null
    }
    try {
      const data = await getCurrentUser()
      setUser(data.user ?? null)
      return data.user
    } catch {
      clearToken()
      setUser(null)
      return null
    }
  }, [])

  const logout = useCallback(() => {
    logoutUser()
    setUser(null)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      if (!getToken()) {
        if (!cancelled) {
          setUser(null)
          setLoading(false)
        }
        return
      }
      try {
        const data = await getCurrentUser()
        if (!cancelled) setUser(data.user ?? null)
      } catch {
        if (!cancelled) {
          clearToken()
          setUser(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isLoggedIn: Boolean(user),
      isAdmin: user?.role === 'admin',
      setUser,
      refreshUser,
      logout,
    }),
    [user, loading, refreshUser, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
