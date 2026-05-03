'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/components/ToastProvider'

function LoginFormContent() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/process'
  const { sendCode, verifyAndLogin } = useAuth()
  const { showToast } = useToast()

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [verifying, setVerifying] = useState(false)
  const [focused, setFocused] = useState<'email' | 'code' | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => setCountdown(c => c - 1), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [countdown > 0])

  async function handleSendCode() {
    if (!email.trim() || sending || countdown > 0) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showToast('请输入有效的邮箱地址')
      return
    }
    setSending(true)
    try {
      await sendCode(email.trim())
      setCountdown(60)
      showToast('验证码已发送至 ' + email.trim())
    } catch {
      showToast('发送失败，请稍后重试')
    } finally {
      setSending(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !code.trim()) {
      showToast('请输入邮箱和验证码')
      return
    }
    setVerifying(true)
    const ok = await verifyAndLogin(email.trim(), code.trim())
    setVerifying(false)
    if (ok) {
      showToast('登录成功')
      router.push(redirect)
    } else {
      showToast('验证码错误，请重试（试试 123456）')
    }
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex w-[480px] xl:w-[560px] relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800">
        {/* Decorative circles */}
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-accent-400/8 blur-3xl" />
        <div className="absolute top-1/3 left-12 w-48 h-48 rounded-full bg-brand-500/20 blur-2xl" />

        <div className="relative flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Top: Logo */}
          <div>
            <a href="/" className="text-3xl xl:text-4xl font-bold text-white tracking-tight font-[family-name:var(--font-display)]">
              PaperTune
            </a>
            <p className="text-brand-200 text-sm xl:text-base mt-2 leading-relaxed">
              智能论文降重助手
            </p>
          </div>

          {/* Middle: Features */}
          <div className="space-y-6">
            <FeatureItem
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
              title="规则引擎 + AI 驱动"
              desc="同义词替换、句式变换、AI 痕迹消除，多重策略精准降重"
            />
            <FeatureItem
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              title="实时预览即改即得"
              desc="上传 .docx，逐段预览改写效果，导出对照版清晰可见"
            />
            <FeatureItem
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
              title="本地处理 · 数据安全"
              desc="规则引擎在浏览器端运行，论文内容不上传服务器，隐私无忧"
            />
          </div>

          {/* Bottom: Quote */}
          <div>
            <p className="text-brand-300/70 text-xs leading-relaxed">
              已服务 10,000+ 高校学生和科研人员，<br />助力通过知网、维普、万方查重检测
            </p>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-pg-bg">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <a href="/" className="text-2xl font-bold text-brand-600 tracking-tight font-[family-name:var(--font-display)]">
              PaperTune
            </a>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl xl:text-3xl font-bold text-pg-text font-[family-name:var(--font-display)] tracking-tight">
              登录 / 注册
            </h1>
            <p className="text-pg-muted text-sm mt-1.5">
              输入邮箱获取验证码，即可开始使用
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-pg-text mb-2">邮箱地址</label>
              <div
                className={`flex items-center gap-3 bg-white rounded-xl border-2 px-4 py-3 transition-all ${
                  focused === 'email' ? 'border-brand-400 shadow-[0_0_0_4px_rgba(30,58,95,0.06)]' : 'border-pg-border'
                }`}
              >
                <svg className="w-5 h-5 text-pg-subtle shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent text-sm text-pg-text placeholder:text-pg-subtle outline-none"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Verification Code */}
            <div>
              <label className="block text-sm font-medium text-pg-text mb-2">验证码</label>
              <div
                className={`flex items-center gap-3 bg-white rounded-xl border-2 px-4 py-3 transition-all ${
                  focused === 'code' ? 'border-brand-400 shadow-[0_0_0_4px_rgba(30,58,95,0.06)]' : 'border-pg-border'
                }`}
              >
                <svg className="w-5 h-5 text-pg-subtle shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onFocus={() => setFocused('code')}
                  onBlur={() => setFocused(null)}
                  placeholder="输入 6 位验证码"
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
                  {sending ? '发送中...' : countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={verifying}
              className="w-full py-3.5 bg-brand-600 text-white rounded-2xl font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-600/25 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {verifying ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  验证中...
                </span>
              ) : '登录 / 注册'}
            </button>
          </form>

          {/* Footer hint */}
          <p className="text-center text-xs text-pg-subtle mt-8">
            首次输入邮箱将自动注册 PaperTune 账号
          </p>

          {/* Return home */}
          <a
            href="/"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm text-pg-subtle hover:text-pg-text transition-colors"
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
