'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ToastProvider'
import { randomInt } from '@/lib/utils'

interface Props {
  paragraphs: string[]
}

interface RewritePair {
  original: string
  rewritten: string
}

const synonymMap: Record<string, [string, string][]> = {
  light: [['重要', '关键'], ['显著', '明显'], ['影响', '作用'], ['研究', '探讨'], ['表明', '显示']],
  medium: [['重要', '核心'], ['显著', '突出'], ['影响', '制约'], ['研究', '系统分析'], ['表明', '揭示'], ['提出', '强调'], ['首先', '第一'], ['因此', '因而'], ['此外', '另外'], ['不仅', ''], ['而且', '更']],
  deep: [['重要', '根本'], ['显著', '醒目'], ['影响', '左右'], ['研究', '系统考察'], ['表明', '印证'], ['提出', '阐明'], ['首先', '在初始阶段'], ['因此', '正因如此'], ['此外', '除此之外'], ['综上所述', '总体来看'], ['发展', '演进'], ['改变', '重塑']],
}

function generateMockRewrite(text: string, intensity: string): string {
  let result = text
  const reps = synonymMap[intensity] || synonymMap.medium
  reps.forEach(([from, to]) => {
    if (result.includes(from)) result = result.replace(from, to)
  })
  if (intensity === 'deep') {
    result = result.replace(/。/g, () => Math.random() < 0.3 ? '；' : '。')
    if (Math.random() < 0.4) {
      result = result.replace(/的/g, () => Math.random() < 0.15 ? '的‌' : '的')
    }
  }
  return result
}

export default function ResultsView({ paragraphs }: Props) {
  const [phase, setPhase] = useState<'processing' | 'done'>('processing')
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<RewritePair[]>([])
  const [aiBefore] = useState(() => randomInt(55, 85))
  const [aiAfter, setAiAfter] = useState(0)
  const { showToast } = useToast()

  useEffect(() => {
    const total = paragraphs.length
    let current = 0
    const intensity: string = 'medium' // could be passed as prop in real implementation

    const interval = setInterval(() => {
      current++
      setProgress(Math.round((current / total) * 100))
      if (current >= total) {
        clearInterval(interval)
        setTimeout(() => {
          const pairs = paragraphs.map(p => ({
            original: p,
            rewritten: generateMockRewrite(p, intensity),
          }))
          setResults(pairs)
          setAiAfter(intensity === 'deep' ? randomInt(15, 30) : intensity === 'medium' ? randomInt(20, 40) : randomInt(30, 50))
          setPhase('done')
        }, 350)
      }
    }, 280)

    return () => clearInterval(interval)
  }, [paragraphs])

  function handleExport(mode: 'single' | 'compare') {
    showToast(mode === 'compare' ? '正在生成对照版 .docx，即将下载...' : '正在生成改写版 .docx，即将下载...')
    setTimeout(() => showToast('导出成功'), 2000)
  }

  const charCount = results.reduce((s, p) => s + p.rewritten.length, 0)

  return (
    <div>
      {/* Progress bar */}
      {phase === 'processing' && (
        <div className="bg-white rounded-2xl border border-pg-border p-5 mb-6 slide-up shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-600 rounded-full animate-spin" />
            <div>
              <p className="font-medium text-pg-text text-sm">正在处理中</p>
              <p className="text-xs text-pg-muted">已处理 {Math.round(progress / 100 * paragraphs.length)}/{paragraphs.length} 段</p>
            </div>
          </div>
          <div className="mt-4 bg-pg-surface rounded-full h-1.5">
            <div
              className="progress-bar bg-gradient-to-r from-brand-500 to-accent-500 h-1.5 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      {phase === 'done' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 slide-up">
            <div className="bg-white rounded-xl p-4 text-center border border-pg-border shadow-sm">
              <p className="text-2xl font-bold text-brand-600 font-[family-name:var(--font-display)]">{results.length}</p>
              <p className="text-xs text-pg-muted mt-0.5">处理段落</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-pg-border shadow-sm">
              <p className="text-2xl font-bold text-accent-600 font-[family-name:var(--font-display)]">{charCount}</p>
              <p className="text-xs text-pg-muted mt-0.5">改写字数</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-pg-border shadow-sm">
              <p className="text-2xl font-bold text-red-500 font-[family-name:var(--font-display)]">{aiBefore}</p>
              <p className="text-xs text-pg-muted mt-0.5">处理前 AI 分</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-pg-border shadow-sm">
              <p className="text-2xl font-bold text-accent-500 font-[family-name:var(--font-display)]">{aiAfter}</p>
              <p className="text-xs text-pg-muted mt-0.5">处理后 AI 分</p>
            </div>
          </div>

          {/* Comparison list */}
          <div className="bg-white rounded-2xl border border-pg-border overflow-hidden slide-up shadow-sm mb-6">
            <div className="bg-pg-bg border-b border-pg-border px-4 py-2.5 flex items-center justify-between">
              <span className="text-sm font-medium text-[#334155]">逐段对比</span>
              <div className="flex items-center gap-2">
                <button onClick={() => handleExport('single')} className="btn-primary px-4 py-1.5 bg-brand-600 text-white text-xs rounded-lg font-medium shadow-sm">导出改写版</button>
                <button onClick={() => handleExport('compare')} className="px-4 py-1.5 bg-white text-[#334155] text-xs rounded-lg font-medium border border-pg-border hover:bg-pg-surface transition-colors">导出对照版</button>
              </div>
            </div>
            <div className="divide-y divide-pg-surface max-h-[600px] overflow-y-auto">
              {results.map((p, i) => (
                <div key={i} className="px-4 py-4 hover:bg-pg-bg transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-pg-subtle bg-pg-surface px-2 py-0.5 rounded-md">第 {i + 1} 段</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="text-sm text-[#475569] leading-relaxed border-l-2 border-orange-200 pl-3">
                      <span className="text-xs text-orange-400 font-medium block mb-1">原文</span>
                      {p.original}
                    </div>
                    <div className="text-sm text-pg-text leading-relaxed border-l-2 border-accent-300 pl-3">
                      <span className="text-xs text-accent-500 font-medium block mb-1">改写</span>
                      {p.rewritten}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
