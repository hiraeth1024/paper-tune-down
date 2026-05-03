'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface User {
  email: string
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  sendCode: (email: string) => Promise<void>
  verifyAndLogin: (email: string, code: string) => Promise<boolean>
  logout: () => void
  requireAuth: () => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

const STORAGE_KEY = 'papertune_user'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setUser(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  const sendCode = useCallback(async (email: string) => {
    // Mock: simulate sending verification code
    await new Promise(r => setTimeout(r, 800))
    console.log(`[Mock] Verification code sent to ${email}: 123456`)
  }, [])

  const verifyAndLogin = useCallback(async (email: string, code: string): Promise<boolean> => {
    // Mock: accept "123456" or any 6-digit code starting with "1"
    await new Promise(r => setTimeout(r, 400))
    if (code === '123456' || code.length >= 5) {
      const u = { email }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
      setUser(u)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const requireAuth = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setUser(JSON.parse(stored))
      return true
    }
    return !!user
  }, [user])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, sendCode, verifyAndLogin, logout, requireAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
