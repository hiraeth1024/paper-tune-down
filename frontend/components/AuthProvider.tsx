'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiSendCode, apiLogin, apiRegister, apiGetMe, type AuthUser } from '@/lib/api'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  sendCode: (email: string) => Promise<void>
  login: (emailOrUsername: string, password: string) => Promise<{ ok: boolean; error?: string }>
  register: (email: string, password: string, code: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  requireAuth: () => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

const TOKEN_KEY = 'papertune_token'
const USER_KEY = 'papertune_user'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  // On mount: validate existing token
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return

    apiGetMe().then(result => {
      if (result.ok && result.user) {
        setUser(result.user)
        localStorage.setItem(USER_KEY, JSON.stringify(result.user))
      } else {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      }
    }).catch(() => {
      // Backend unreachable — try cached user
      try {
        const cached = localStorage.getItem(USER_KEY)
        if (cached) setUser(JSON.parse(cached))
      } catch { /* ignore */ }
    })
  }, [])

  const sendCode = useCallback(async (email: string) => {
    const result = await apiSendCode(email)
    if (!result.ok) throw new Error(result.error || '发送失败')
  }, [])

  const login = useCallback(async (emailOrUsername: string, password: string) => {
    const result = await apiLogin(emailOrUsername, password)
    if (result.ok && result.token && result.user) {
      localStorage.setItem(TOKEN_KEY, result.token)
      localStorage.setItem(USER_KEY, JSON.stringify(result.user))
      setUser(result.user)
      return { ok: true }
    }
    return { ok: false, error: result.error || '登录失败' }
  }, [])

  const register = useCallback(async (email: string, password: string, code: string) => {
    const result = await apiRegister(email, password, code)
    if (result.ok && result.token && result.user) {
      localStorage.setItem(TOKEN_KEY, result.token)
      localStorage.setItem(USER_KEY, JSON.stringify(result.user))
      setUser(result.user)
      return { ok: true }
    }
    return { ok: false, error: result.error || '注册失败' }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const requireAuth = useCallback(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) return true
    // Also check cached user as fallback
    try {
      const cached = localStorage.getItem(USER_KEY)
      if (cached) {
        setUser(JSON.parse(cached))
        return true
      }
    } catch { /* ignore */ }
    return !!user
  }, [user])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, sendCode, login, register, logout, requireAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
