const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ---- Auth helpers ----

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('papertune_token')
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' }
}

// ---- Auth API ----

export interface AuthUser {
  email: string
  username: string
}

export interface AuthResult {
  ok: boolean
  token?: string
  user?: AuthUser
  error?: string
}

export async function apiSendCode(email: string): Promise<{ ok: boolean; message?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/api/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await res.json()
  if (!res.ok) return { ok: false, error: data.detail || '发送失败' }
  return { ok: true, message: data.message }
}

export async function apiRegister(email: string, password: string, code: string): Promise<AuthResult> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, code }),
  })
  const data = await res.json()
  if (!res.ok) return { ok: false, error: data.detail || '注册失败' }
  return { ok: true, token: data.token, user: data.user }
}

export async function apiLogin(account: string, password: string): Promise<AuthResult> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account, password }),
  })
  const data = await res.json()
  if (!res.ok) return { ok: false, error: data.detail || '登录失败' }
  return { ok: true, token: data.token, user: data.user }
}

export async function apiGetMe(): Promise<AuthResult> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) return { ok: false, error: data.detail || '未登录' }
  return { ok: true, user: data.user }
}

export interface RewritePair {
  original: string
  rewritten: string
  changes: number
  annotated?: string | null
}

export interface ProcessStats {
  total_replacements: number
  zwnj_insertions: number
  ai_patterns_removed: number
}

export interface ProcessResult {
  results: RewritePair[]
  stats: ProcessStats
}

export interface ParagraphInput {
  text: string
  skip: boolean
}

export async function processParagraphs(
  paragraphs: ParagraphInput[],
  mode: string,
  intensity: string,
  zwnjProb: number,
): Promise<ProcessResult> {
  const res = await fetch(`${API_BASE}/api/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paragraphs, mode, intensity, zwnj_prob: zwnjProb }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: '处理失败' }))
    throw new Error(err.detail || '处理失败')
  }
  return res.json()
}

export async function exportDocx(
  results: RewritePair[],
  format: 'compare' | 'single',
  originalFile?: File | null,
) {
  const formData = new FormData()
  if (originalFile) {
    formData.append('file', originalFile)
  }
  formData.append('data', JSON.stringify({ results, format }))

  const res = await fetch(`${API_BASE}/api/export`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('导出失败')

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `papertune_${format}.docx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
