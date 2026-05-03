const steps = [
  { num: 1, title: '上传论文', desc: <>拖拽或点击上传 .docx 文件<br />系统自动解析段落结构</> },
  { num: 2, title: '选择策略', desc: <>选择降重强度和处理模式<br />一键智能改写全文</> },
  { num: 3, title: '导出结果', desc: <>预览改写效果<br />下载处理后的 .docx 或对照版</> },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-pg-border bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-pg-text mb-12 font-[family-name:var(--font-display)]">三步完成降重</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map(s => (
            <div key={s.num} className="text-center">
              <div className="w-14 h-14 bg-brand-50 text-brand-700 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4 font-[family-name:var(--font-display)]">{s.num}</div>
              <h4 className="font-semibold text-pg-text mb-1.5">{s.title}</h4>
              <p className="text-sm text-pg-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
