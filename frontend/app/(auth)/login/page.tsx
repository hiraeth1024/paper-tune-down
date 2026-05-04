'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/components/ToastProvider'
import WaveBackground from '@/components/WaveBackground'

type Tab = 'login' | 'register'

function LoginFormContent() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/process'
  const { sendCode, login, register } = useAuth()
  const { showToast } = useToast()

  const [tab, setTab] = useState<Tab>('login')

  // Login fields
  const [loginAccount, setLoginAccount] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Register fields
  const [regEmail, setRegEmail] = useState('')
  const [regCode, setRegCode] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('')
  const [sending, setSending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [regLoading, setRegLoading] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => setCountdown(c => c - 1), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [countdown > 0])

  // ---- Login ----
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!loginAccount.trim() || !loginPassword.trim()) {
      showToast('请输入账号和密码')
      return
    }
    setLoginLoading(true)
    const result = await login(loginAccount.trim(), loginPassword)
    setLoginLoading(false)
    if (result.ok) {
      showToast('登录成功')
      router.push(redirect)
    } else {
      showToast(result.error || '登录失败')
    }
  }

  // ---- Register: send code ----
  async function handleSendCode() {
    if (!regEmail.trim() || sending || countdown > 0) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      showToast('请输入有效的邮箱地址')
      return
    }
    setSending(true)
    try {
      await sendCode(regEmail.trim())
      setCountdown(60)
      showToast('验证码已发送至 ' + regEmail.trim())
    } catch {
      showToast('发送失败，请稍后重试')
    } finally {
      setSending(false)
    }
  }

  // ---- Password strength ----
  function getPasswordStrength(pw: string): { level: number; label: string; color: string; width: string } {
    if (!pw) return { level: 0, label: '', color: '', width: '0%' }
    let score = 0
    if (pw.length >= 8) score++
    if (pw.length >= 12) score++
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
    if (/\d/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    if (score <= 1) return { level: 1, label: '弱', color: '#ef4444', width: '25%' }
    if (score <= 2) return { level: 2, label: '中等', color: '#f59e0b', width: '50%' }
    if (score <= 3) return { level: 3, label: '良好', color: '#059669', width: '75%' }
    return { level: 4, label: '强', color: '#059669', width: '100%' }
  }

  const pwStrength = getPasswordStrength(regPassword)
  const pwMismatch = regPasswordConfirm && regPassword !== regPasswordConfirm

  // ---- Register ----
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!regEmail.trim() || !regPassword.trim() || !regCode.trim() || !regPasswordConfirm.trim()) {
      showToast('请填写所有字段')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      showToast('请输入有效的邮箱地址')
      return
    }
    if (pwStrength.level < 2) {
      showToast('密码强度不足，请使用 8 位以上包含字母和数字的密码')
      return
    }
    if (regPassword !== regPasswordConfirm) {
      showToast('两次输入的密码不一致')
      return
    }
    setRegLoading(true)
    const result = await register(regEmail.trim(), regPassword, regCode.trim())
    setRegLoading(false)
    if (result.ok) {
      showToast('注册成功')
      router.push(redirect)
    } else {
      showToast(result.error || '注册失败')
    }
  }

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden bg-pg-bg">
      <WaveBackground />

      {/* ====== Left — Branding ====== */}
      <div className="hidden lg:flex w-[480px] xl:w-[560px] relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-accent-400/8 blur-3xl" />
        <div className="absolute top-1/3 left-12 w-48 h-48 rounded-full bg-brand-500/20 blur-2xl" />

        <div className="relative flex flex-col justify-between p-12 xl:p-16 w-full">
          <div>
            <a href="/" className="text-3xl xl:text-4xl font-bold text-white tracking-tight font-[family-name:var(--font-display)]">
              PaperTune
            </a>
            <p className="text-brand-200 text-sm xl:text-base mt-2 leading-relaxed">
              智能论文降重助手
            </p>
          </div>

          <div className="space-y-6">
            <FeatureItem
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
              title="规则引擎 + AI 驱动"
              desc="同义词替换、句式变换、AI 痕迹消除"
            />
            <FeatureItem
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              title="实时预览即改即得"
              desc="上传 .docx，逐段预览改写效果"
            />
            <FeatureItem
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
              title="本地处理 · 数据安全"
              desc="论文内容不上传服务器，隐私无忧"
            />
          </div>

          <div>
            <p className="text-brand-300/70 text-xs leading-relaxed">
              已服务 10,000+ 高校学生和科研人员<br />助力通过知网、维普、万方查重检测
            </p>
          </div>
        </div>
      </div>

      {/* ====== Right — Forms ====== */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <a href="/" className="text-2xl font-bold text-brand-600 tracking-tight font-[family-name:var(--font-display)]">
              PaperTune
            </a>
          </div>

          {/* Tabs */}
          <div className="flex bg-white rounded-2xl border border-pg-border p-1 mb-8 shadow-sm relative">
            {(['login', 'register'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all relative ${
                  tab === t ? 'text-white' : 'text-pg-subtle hover:text-pg-text'
                }`}
              >
                <span className="relative z-10">{t === 'login' ? '登录' : '注册'}</span>
                {tab === t && (
                  <span className="absolute inset-0 bg-brand-600 rounded-xl shadow-sm" />
                )}
              </button>
            ))}
          </div>

          {/* ========== LOGIN FORM ========== */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5 animate-fade-in">
              {/* Account */}
              <div>
                <label className="block text-sm font-medium text-pg-text mb-2">用户名 / 邮箱</label>
                <div
                  className={`flex items-center gap-3 bg-white rounded-xl border-2 px-4 py-3 transition-all ${
                    focused === 'loginAccount' ? 'border-brand-400 shadow-[0_0_0_4px_rgba(30,58,95,0.06)]' : 'border-pg-border'
                  }`}
                >
                  <svg className="w-5 h-5 text-pg-subtle shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    type="text"
                    value={loginAccount}
                    onChange={e => setLoginAccount(e.target.value)}
                    onFocus={() => setFocused('loginAccount')}
                    onBlur={() => setFocused(null)}
                    placeholder="用户名或邮箱地址"
                    className="flex-1 bg-transparent text-sm text-pg-text placeholder:text-pg-subtle outline-none"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-pg-text mb-2">密码</label>
                <div
                  className={`flex items-center gap-3 bg-white rounded-xl border-2 px-4 py-3 transition-all ${
                    focused === 'loginPassword' ? 'border-brand-400 shadow-[0_0_0_4px_rgba(30,58,95,0.06)]' : 'border-pg-border'
                  }`}
                >
                  <svg className="w-5 h-5 text-pg-subtle shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    onFocus={() => setFocused('loginPassword')}
                    onBlur={() => setFocused(null)}
                    placeholder="输入密码"
                    className="flex-1 bg-transparent text-sm text-pg-text placeholder:text-pg-subtle outline-none"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 bg-brand-600 text-white rounded-2xl font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-600/25 active:translate-y-0 disabled:opacity-60"
              >
                {loginLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    登录中...
                  </span>
                ) : '登录'}
              </button>

              {/* Quick demo login */}
              <button
                type="button"
                onClick={async () => {
                  setLoginAccount('admin')
                  setLoginPassword('admin123')
                  const result = await login('admin', 'admin123')
                  if (result.ok) {
                    showToast('登录成功')
                    router.push(redirect)
                  } else {
                    showToast(result.error || '登录失败，请检查后端是否启动')
                  }
                }}
                className="w-full mt-3 py-2 text-xs text-pg-subtle hover:text-brand-600 border border-dashed border-pg-border hover:border-brand-300 rounded-xl transition-colors"
              >
                快速体验 (admin / admin123)
              </button>

              <p className="text-center text-xs text-pg-subtle mt-3">
                还没有账号？<button type="button" onClick={() => setTab('register')} className="text-brand-600 font-medium hover:underline">立即注册</button>
              </p>
            </form>
          )}

          {/* ========== REGISTER FORM ========== */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-pg-text mb-2">邮箱地址</label>
                <div
                  className={`flex items-center gap-3 bg-white rounded-xl border-2 px-4 py-3 transition-all ${
                    focused === 'regEmail' ? 'border-brand-400 shadow-[0_0_0_4px_rgba(30,58,95,0.06)]' : 'border-pg-border'
                  }`}
                >
                  <svg className="w-5 h-5 text-pg-subtle shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    onFocus={() => setFocused('regEmail')}
                    onBlur={() => setFocused(null)}
                    placeholder="your@email.com"
                    className="flex-1 bg-transparent text-sm text-pg-text placeholder:text-pg-subtle outline-none"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Verification code */}
              <div>
                <label className="block text-sm font-medium text-pg-text mb-2">验证码</label>
                <div
                  className={`flex items-center gap-3 bg-white rounded-xl border-2 px-4 py-3 transition-all ${
                    focused === 'regCode' ? 'border-brand-400 shadow-[0_0_0_4px_rgba(30,58,95,0.06)]' : 'border-pg-border'
                  }`}
                >
                  <svg className="w-5 h-5 text-pg-subtle shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type="text"
                    value={regCode}
                    onChange={e => setRegCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onFocus={() => setFocused('regCode')}
                    onBlur={() => setFocused(null)}
                    placeholder="6 位验证码"
                    maxLength={6}
                    className="flex-1 bg-transparent text-sm text-pg-text placeholder:text-pg-subtle outline-none tracking-[0.3em]"
                    autoComplete="one-time-code"
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sending || countdown > 0}
                    className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                      countdown > 0 || sending
                        ? 'bg-pg-surface text-pg-subtle cursor-not-allowed'
                        : 'bg-brand-50 text-brand-600 hover:bg-brand-100 active:scale-95'
                    }`}
                  >
                    {sending ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-pg-text mb-2">设置密码</label>
                <div
                  className={`flex items-center gap-3 bg-white rounded-xl border-2 px-4 py-3 transition-all ${
                    focused === 'regPassword' ? 'border-brand-400 shadow-[0_0_0_4px_rgba(30,58,95,0.06)]' : 'border-pg-border'
                  }`}
                >
                  <svg className="w-5 h-5 text-pg-subtle shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    onFocus={() => setFocused('regPassword')}
                    onBlur={() => setFocused(null)}
                    placeholder="8-20 位，建议含大小写字母和数字"
                    className="flex-1 bg-transparent text-sm text-pg-text placeholder:text-pg-subtle outline-none"
                    autoComplete="new-password"
                  />
                </div>
                {/* Password strength bar */}
                {regPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-pg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: pwStrength.width, backgroundColor: pwStrength.color }}
                      />
                    </div>
                    <span className="text-xs font-medium" style={{ color: pwStrength.color }}>{pwStrength.label}</span>
                  </div>
                )}
                <p className="text-xs text-pg-subtle mt-1.5 leading-relaxed">
                  需包含大小写字母和数字，至少 8 个字符
                </p>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-pg-text mb-2">确认密码</label>
                <div
                  className={`flex items-center gap-3 bg-white rounded-xl border-2 px-4 py-3 transition-all ${
                    pwMismatch ? 'border-red-300' : focused === 'regPasswordConfirm' ? 'border-brand-400 shadow-[0_0_0_4px_rgba(30,58,95,0.06)]' : 'border-pg-border'
                  }`}
                >
                  <svg className="w-5 h-5 text-pg-subtle shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type="password"
                    value={regPasswordConfirm}
                    onChange={e => setRegPasswordConfirm(e.target.value)}
                    onFocus={() => setFocused('regPasswordConfirm')}
                    onBlur={() => setFocused(null)}
                    placeholder="再次输入密码"
                    className="flex-1 bg-transparent text-sm text-pg-text placeholder:text-pg-subtle outline-none"
                    autoComplete="new-password"
                  />
                  {pwMismatch && (
                    <span className="text-xs text-red-500 shrink-0">不一致</span>
                  )}
                </div>
                {pwMismatch && (
                  <p className="text-xs text-red-500 mt-1">两次输入的密码不一致</p>
                )}
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-3.5 bg-brand-600 text-white rounded-2xl font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-600/25 active:translate-y-0 disabled:opacity-60"
              >
                {regLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    注册中...
                  </span>
                ) : '创建账号'}
              </button>

              <p className="text-center text-xs text-pg-subtle">
                已有账号？<button type="button" onClick={() => setTab('login')} className="text-brand-600 font-medium hover:underline">去登录</button>
              </p>
            </form>
          )}

          {/* Return home */}
          <a
            href="/"
            className="mt-8 flex items-center justify-center gap-1.5 text-sm text-pg-subtle hover:text-pg-text transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            返回首页
          </a>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-pg-bg">
        <div className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  )
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-accent-300 shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <p className="text-brand-200/80 text-xs mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
