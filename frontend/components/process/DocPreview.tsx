import { truncate } from '@/lib/utils'

interface Props {
  paragraphs: string[]
}

export default function DocPreview({ paragraphs }: Props) {
  if (!paragraphs.length) {
    return (
      <div className="bg-white rounded-2xl border border-pg-border overflow-hidden slide-up shadow-sm h-full">
        <div className="bg-pg-bg border-b border-pg-border px-4 py-2.5 flex items-center justify-between">
          <span className="text-sm font-medium text-[#334155]">文档预览</span>
          <span className="text-xs text-pg-subtle" />
        </div>
        <div className="p-10 text-center text-pg-subtle">
          <svg className="w-10 h-10 mx-auto mb-3 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <p className="text-sm">上传文件后在此预览论文内容</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-pg-border overflow-hidden slide-up shadow-sm h-full">
      <div className="bg-pg-bg border-b border-pg-border px-4 py-2.5 flex items-center justify-between">
        <span className="text-sm font-medium text-[#334155]">文档预览</span>
        <span className="text-xs text-pg-subtle">{paragraphs.length} 段</span>
      </div>
      <div className="divide-y divide-pg-surface max-h-[500px] overflow-y-auto">
        {paragraphs.map((p, i) => (
          <div key={i} className="px-4 py-3 hover:bg-pg-bg transition-colors">
            <span className="text-xs text-pg-subtle font-medium mr-2">第 {i + 1} 段</span>
            <span className="text-sm text-[#334155] leading-relaxed">{truncate(p, 110)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
