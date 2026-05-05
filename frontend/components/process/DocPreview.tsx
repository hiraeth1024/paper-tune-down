import { truncate } from '@/lib/utils'
import { countByType, getDisplayParagraphs, type ParsedParagraph, type MetadataLabel } from '@/lib/docx-parser'

const labelColors: Record<MetadataLabel, string> = {
  '标题': 'bg-pg-surface text-pg-subtle',
  '摘要': 'bg-amber-50 text-amber-600',
  '关键词': 'bg-purple-50 text-purple-600',
  '正文': 'bg-brand-50 text-brand-600',
  '封面': 'bg-sky-50 text-sky-600',
}

interface Props {
  paragraphs: ParsedParagraph[]
}

export default function DocPreview({ paragraphs }: Props) {
  const displayParagraphs = getDisplayParagraphs(paragraphs)

  if (!displayParagraphs.length) {
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

  const { content, metadata } = countByType(paragraphs)

  return (
    <div className="bg-white rounded-2xl border border-pg-border overflow-hidden slide-up shadow-sm h-full">
      <div className="bg-pg-bg border-b border-pg-border px-4 py-2.5 flex items-center justify-between">
        <span className="text-sm font-medium text-[#334155]">文档预览</span>
        <span className="text-xs text-pg-subtle">
          {content} 个正文段落将被处理 · {metadata} 个元数据段落跳过
        </span>
      </div>
      <div className="divide-y divide-pg-surface max-h-[800px] overflow-y-auto">
        {paragraphs.map((p, docIdx) => {
          if (p.text.length < 5) return null
          return (
          <div
            key={docIdx}
            className={`px-4 py-3 hover:bg-pg-bg transition-colors flex items-start gap-3 ${
              p.type === 'metadata' ? 'opacity-60 bg-pg-bg/30' : ''
            }`}
          >
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${labelColors[p.label]} shrink-0 mt-0.5`}>
              {p.label}
            </span>
            <span className="text-xs text-pg-subtle font-medium shrink-0 mt-0.5">第 {docIdx + 1} 段</span>
            <span className="text-sm text-[#334155] leading-relaxed flex-1">{truncate(p.text, 110)}</span>
            {p.type === 'metadata' && (
              <span className="text-xs text-pg-subtle bg-pg-surface px-1.5 py-0.5 rounded shrink-0">跳过</span>
            )}
          </div>
        )})}
      </div>
    </div>
  )
}
