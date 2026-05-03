const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
    ),
    iconBg: 'bg-red-50 text-red-500',
    title: '智能降重引擎',
    desc: '规则引擎驱动：同义词替换 · 句式重组 · 语序调整，层层递进降低重复率',
    tags: ['同义词库', '句法模板', '零宽不连词'],
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
    ),
    iconBg: 'bg-purple-50 text-purple-500',
    title: 'AI 痕迹消除',
    desc: '句长随机化 · 连接词多样化 · AI 典型用语替换，让文本更具人类写作特征',
    tags: ['句长波动', 'AI 模式识别', '困惑度调节'],
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
    ),
    iconBg: 'bg-blue-50 text-blue-500',
    title: '查重平台导航',
    desc: '聚合知网、维普、万方、Turnitin 等主流平台，一目了然的对比与入口',
    tags: ['8 大平台', '价格对比', '适用场景'],
  },
]

export default function Features() {
  return (
    <section className="max-w-5xl mx-auto px-4 pb-20">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-pg-text mb-3 font-[family-name:var(--font-display)]">三大核心能力</h2>
      <p className="text-center text-pg-muted mb-10 text-sm">从降重到降 AI，覆盖论文查重全场景</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <div key={i} className="card bg-white rounded-2xl p-6 border border-pg-border shadow-sm">
            <div className={`w-10 h-10 ${f.iconBg} rounded-xl flex items-center justify-center mb-4`}>
              {f.icon}
            </div>
            <h3 className="text-base font-bold text-pg-text mb-2 font-[family-name:var(--font-display)]">{f.title}</h3>
            <p className="text-sm text-[#475569] leading-relaxed mb-4">{f.desc}</p>
            <div className="flex flex-wrap gap-1.5">
              {f.tags.map(t => (
                <span key={t} className="text-xs text-pg-muted bg-pg-surface px-2 py-0.5 rounded-md">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
