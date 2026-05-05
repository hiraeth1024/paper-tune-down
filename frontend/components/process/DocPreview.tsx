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
  manualSkip: Set<number>
  onToggleSkip: (index: number) => void
}

export default function DocPreview({ paragraphs, manualSkip, onToggleSkip }: Props) {
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

  function isSkipped(index: number): boolean {
    if (manualSkip.has(index)) return true
    return paragraphs[index]?.type === 'metadata'
  }

  return (
    <div className="bg-white rounded-2xl border border-pg-border overflow-hidden slide-up shadow-sm h-full">
      <div className="bg-pg-bg border-b border-pg-border px-4 py-2.5 flex items-center justify-between">
        <span className="text-sm font-medium text-[#334155]">文档预览</span>
        <span className="text-xs text-pg-subtle">
          {content} 个正文段落将被处理 · {metadata} 个元数据段落跳过
        </span>
      </div>

      {/* Warning banner */}
      <div className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-start gap-2">
        <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="text-xs text-amber-700 leading-relaxed">
          改写可能改变原文格式，建议手动跳过不需要处理的部分。点击右侧开关可切换跳过/处理状态。
        </p>
      </div>

      <div className="divide-y divide-pg-surface max-h-[700px] overflow-y-auto mt-3">
        {paragraphs.map((p, docIdx) => {
          if (p.text.length < 5) return null
          const skipped = isSkipped(docIdx)
          return (
          <div
            key={docIdx}
            className={`px-4 py-3 hover:bg-pg-bg transition-colors flex items-start gap-3 ${
              skipped ? 'opacity-60 bg-pg-bg/30' : ''
            }`}
          >
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${labelColors[p.label]} shrink-0 mt-0.5`}>
              {p.label}
            </span>
            <span className="text-xs text-pg-subtle font-medium shrink-0 mt-0.5">第 {docIdx + 1} 段</span>
            <span className="text-sm text-[#334155] leading-relaxed flex-1">{truncate(p.text, 110)}</span>
            {/* Toggle switch */}
            <button
              onClick={() => onToggleSkip(docIdx)}
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-300 focus:ring-offset-1 ${
                skipped ? 'bg-gray-300' : 'bg-brand-500'
              }`}
              title={skipped ? '点击切换为处理' : '点击切换为跳过'}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  skipped ? 'translate-x-1' : 'translate-x-[18px]'
                }`}
              />
            </button>
          </div>
        )})}
      </div>
    </div>
  )
}
