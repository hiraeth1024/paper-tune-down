export default function PreviewWindow() {
  return (
    <section className="max-w-4xl mx-auto px-4 pb-16">
      <div className="bg-white rounded-2xl border border-pg-border shadow-sm overflow-hidden">
        {/* Browser chrome */}
        <div className="bg-pg-bg border-b border-pg-border px-4 py-2.5 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="ml-2 text-xs text-pg-muted">毕业论文_初稿.docx — 处理结果预览</span>
        </div>

        {/* Before/After text */}
        <div className="grid md:grid-cols-2 divide-x divide-pg-border">
          <div className="p-5 sm:p-6">
            <p className="text-xs font-semibold text-pg-muted uppercase tracking-wider mb-3">原文</p>
            <p className="text-sm text-[#334155] leading-relaxed">
              随着互联网技术的快速发展，电子商务已经成为了现代商业活动中最<span className="diff-highlight">重要</span>的组成部分之一。<span className="diff-highlight">首先</span>，电子商务<span className="diff-highlight">不仅</span>改变了传统的交易方式，<span className="diff-highlight">而且</span>对消费者的购买行为<span className="diff-highlight">产生了深远的影响</span>。
            </p>
            <p className="text-xs text-[#DC2626] mt-3 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              AI 检出风险：<span className="font-semibold">高</span>
            </p>
          </div>
          <div className="p-5 sm:p-6 bg-brand-50/30">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-3">降重 + 降 AI 后</p>
            <p className="text-sm text-pg-text leading-relaxed">
              伴随网络技术的快速演进，电商已经变成当代商业活动的<span className="diff-added">关键</span>组成环节。<span className="diff-added">在初始阶段</span>，电子商务改变了传统交易模式，<span className="diff-added">更</span>对消费者的购物行为<span className="diff-added">发挥了显著作用</span>。
            </p>
            <p className="text-xs text-accent-600 mt-3 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              AI 检出风险：<span className="font-semibold">低</span>
            </p>
          </div>
        </div>

        {/* Bar charts */}
        <div className="border-t border-pg-border">
          <div className="grid md:grid-cols-2 divide-x divide-pg-border">
            {/* Plagiarism rate chart */}
            <div className="p-5 sm:p-6">
              <p className="text-xs font-semibold text-pg-muted uppercase tracking-wider mb-4">查重率对比</p>
              <div className="space-y-4">
                <div className="flex items-end gap-3">
                  <span className="text-xs text-pg-subtle w-8 shrink-0">处理前</span>
                  <div className="flex-1 bg-red-100 rounded-full h-7 relative overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '72%' }}>
                      <span className="text-xs font-bold text-white">72%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-xs text-pg-subtle w-8 shrink-0">处理后</span>
                  <div className="flex-1 bg-accent-100 rounded-full h-7 relative overflow-hidden">
                    <div className="bg-accent-500 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '18%' }}>
                      <span className="text-xs font-bold text-white">18%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-accent-600 font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  降低 54%
                </div>
              </div>
            </div>

            {/* AI rate chart */}
            <div className="p-5 sm:p-6">
              <p className="text-xs font-semibold text-pg-muted uppercase tracking-wider mb-4">AI 检出率对比</p>
              <div className="space-y-4">
                <div className="flex items-end gap-3">
                  <span className="text-xs text-pg-subtle w-8 shrink-0">处理前</span>
                  <div className="flex-1 bg-orange-100 rounded-full h-7 relative overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '78%' }}>
                      <span className="text-xs font-bold text-white">78%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-xs text-pg-subtle w-8 shrink-0">处理后</span>
                  <div className="flex-1 bg-blue-100 rounded-full h-7 relative overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '22%' }}>
                      <span className="text-xs font-bold text-white">22%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  降低 56%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
