'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface User {
  email: string
  username: string
}

interface AuthContextValue {
  user: User | null
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

const STORAGE_KEY = 'papertune_user'
const DB_KEY = 'papertune_users_db'

interface StoredUser {
  email: string
  username: string
  password: string
}

function getUsersDB(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY) || '[]')
  } catch { return [] }
}

function saveUsersDB(users: StoredUser[]) {
  localStorage.setItem(DB_KEY, JSON.stringify(users))
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setUser(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  const persistUser = useCallback((u: User) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    setUser(u)
  }, [])

  const sendCode = useCallback(async (email: string) => {
    await new Promise(r => setTimeout(r, 800))
    console.log(`[Mock] Verification code sent to ${email}: 123456`)
  }, [])

  const login = useCallback(async (emailOrUsername: string, password: string) => {
    await new Promise(r => setTimeout(r, 500))
    const users = getUsersDB()
    const found = users.find(u =>
      (u.email === emailOrUsername || u.username === emailOrUsername) && u.password === password
    )
    if (found) {
      persistUser({ email: found.email, username: found.username })
      return { ok: true }
    }
    // Also accept mock admin account
    if (emailOrUsername === 'admin' && password === 'admin123') {
      persistUser({ email: 'admin@test.com', username: 'admin' })
      return { ok: true }
    }
    return { ok: false, error: '用户名/邮箱或密码错误' }
  }, [persistUser])

  const register = useCallback(async (email: string, password: string, code: string) => {
    await new Promise(r => setTimeout(r, 500))
    if (code !== '123456' && code.length < 5) {
      return { ok: false, error: '验证码错误（试试 123456）' }
    }
    const users = getUsersDB()
    if (users.find(u => u.email === email)) {
      return { ok: false, error: '该邮箱已被注册' }
    }
    const username = email.split('@')[0]
    if (users.find(u => u.username === username)) {
      return { ok: false, error: '该用户名已存在' }
    }
    users.push({ email, username, password })
    saveUsersDB(users)
    persistUser({ email, username })
    return { ok: true }
  }, [persistUser])

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
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, sendCode, login, register, logout, requireAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
