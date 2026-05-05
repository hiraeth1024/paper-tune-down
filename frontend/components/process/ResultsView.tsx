'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ToastProvider'
import { exportDocx, type RewritePair, type ProcessStats } from '@/lib/api'

interface Props {
  results: RewritePair[] | null
  stats: ProcessStats | null
  processing: boolean
  paragraphCount: number
  originalFile: File | null
}

export default function ResultsView({ results, stats, processing, paragraphCount, originalFile }: Props) {
  const [progress, setProgress] = useState(0)
  const [exporting, setExporting] = useState(false)
  const { showToast } = useToast()

  // Animate progress bar while waiting
  useEffect(() => {
    if (!processing) {
      setProgress(100)
      return
    }
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 300)
    return () => clearInterval(interval)
  }, [processing])

  async function handleExport(mode: 'single' | 'compare') {
    if (!results || exporting) return
    setExporting(true)
    try {
      await exportDocx(results, mode, originalFile)
      showToast('导出成功')
    } catch {
      showToast('导出失败，请稍后重试')
    } finally {
      setExporting(false)
    }
  }

  const charCount = results?.reduce((s, p) => s + p.rewritten.length, 0) || 0

  return (
    <div>
      {/* Processing state */}
      {processing && (
        <div className="bg-white rounded-2xl border border-pg-border p-5 mb-6 slide-up shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-600 rounded-full animate-spin" />
            <div>
              <p className="font-medium text-pg-text text-sm">正在处理中</p>
              <p className="text-xs text-pg-muted">正在通过后端引擎处理 {paragraphCount} 段文本</p>
            </div>
          </div>
          <div className="mt-4 bg-pg-surface rounded-full h-1.5">
            <div
              className="progress-bar bg-gradient-to-r from-brand-500 to-accent-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.round(progress)}%` }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {results && stats && (
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
              <p className="text-2xl font-bold text-indigo-500 font-[family-name:var(--font-display)]">{stats.total_replacements + stats.ai_patterns_removed}</p>
              <p className="text-xs text-pg-muted mt-0.5">改写/去AI处</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-pg-border shadow-sm">
              <p className="text-2xl font-bold text-teal-500 font-[family-name:var(--font-display)]">{stats.zwnj_insertions}</p>
              <p className="text-xs text-pg-muted mt-0.5">ZWNJ 注入</p>
            </div>
          </div>

          {/* Comparison list */}
          <div className="bg-white rounded-2xl border border-pg-border overflow-hidden slide-up shadow-sm mb-6">
            <div className="bg-pg-bg border-b border-pg-border px-4 py-2.5 flex items-center justify-between">
              <span className="text-sm font-medium text-[#334155]">逐段对比</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExport('single')}
                  disabled={exporting}
                  className="btn-primary px-4 py-1.5 bg-brand-600 text-white text-xs rounded-lg font-medium shadow-sm disabled:opacity-60"
                >
                  {exporting ? '导出中...' : '导出改写版'}
                </button>
                <button
                  onClick={() => handleExport('compare')}
                  disabled={exporting}
                  className="px-4 py-1.5 bg-white text-[#334155] text-xs rounded-lg font-medium border border-pg-border hover:bg-pg-surface transition-colors disabled:opacity-60"
                >
                  导出对照版
                </button>
              </div>
            </div>
            <div className="divide-y divide-pg-surface max-h-[600px] overflow-y-auto">
              {results.map((p, i) => (
                <div key={i} className="px-4 py-4 hover:bg-pg-bg transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-pg-subtle bg-pg-surface px-2 py-0.5 rounded-md">第 {i + 1} 段</span>
                    {p.changes === 0 ? (
                      <span className="text-xs text-pg-subtle bg-pg-surface px-1.5 py-0.5 rounded-md">跳过</span>
                    ) : (
                      <span className="text-xs text-accent-500">{p.changes} 处改动</span>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="text-sm text-[#475569] leading-relaxed border-l-2 border-orange-200 pl-3">
                      <span className="text-xs text-orange-400 font-medium block mb-1">原文</span>
                      {p.original}
                    </div>
                    <div className="text-sm text-pg-text leading-relaxed border-l-2 border-accent-300 pl-3">
                      <span className="text-xs text-accent-500 font-medium block mb-1">改写</span>
                      {p.annotated ? (
                        <span
                          className="[&_mark.zwnj-spot]:bg-yellow-300 [&_mark.zwnj-spot]:rounded [&_mark.zwnj-spot]:px-px [&_mark.zwnj-spot]:select-none [&_mark.zwnj-spot]:text-transparent"
                          dangerouslySetInnerHTML={{ __html: p.annotated }}
                        />
                      ) : (
                        p.rewritten
                      )}
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
