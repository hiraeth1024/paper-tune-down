import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="max-w-4xl mx-auto px-4 pt-16 sm:pt-24 pb-12 text-center">
      <div className="inline-flex items-center gap-2 bg-accent-50 text-accent-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full pulse-dot" /> 当前完全免费开放
      </div>

      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-pg-text tracking-tight leading-tight font-[family-name:var(--font-display)]">
        论文<span className="text-brand-600">降重</span>与<span className="text-brand-600">降 AI 率</span><br className="hidden sm:block" />一站式解决方案
      </h1>

      <p className="mt-5 text-base sm:text-lg text-[#475569] max-w-xl mx-auto leading-relaxed">
        上传 <span className="font-medium text-brand-600">.docx</span> 格式论文，智能识别高重复段落，<br className="hidden sm:block" />规则引擎精准改写，保留学术风格的同时有效降低查重率。
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/process" className="btn-primary w-full sm:w-auto px-6 py-3.5 bg-brand-600 text-white rounded-2xl font-semibold text-base shadow-md">
          立即上传论文
        </Link>
        <a href="#how-it-works" className="w-full sm:w-auto px-6 py-3.5 bg-white text-[#334155] rounded-2xl font-semibold text-base border border-pg-border hover:border-brand-300 hover:text-brand-600 transition-colors">
          了解更多
        </a>
      </div>

      <div className="mt-6 flex items-center justify-center gap-5 text-xs text-pg-muted">
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          支持 .docx
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          最大 20MB
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          本地处理
        </span>
      </div>
    </section>
  )
}
