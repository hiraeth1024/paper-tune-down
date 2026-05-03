'use client'

import { useState } from 'react'

interface Props {
  fileName: string
  paragraphCount: number
  charCount: number
  onReset: () => void
  onStart: () => void
}

export default function StrategyPanel({ fileName, paragraphCount, charCount, onReset, onStart }: Props) {
  const [mode, setMode] = useState<'both' | 'rewrite' | 'de_ai'>('both')
  const [intensity, setIntensity] = useState<'light' | 'medium' | 'deep'>('medium')

  const modeOptions: { value: 'both' | 'rewrite' | 'de_ai'; label: string; desc: string }[] = [
    { value: 'both', label: '综合处理', desc: '降重 + 降 AI 率' },
    { value: 'rewrite', label: '仅降重', desc: '同义词替换 + 句式变换' },
    { value: 'de_ai', label: '仅降 AI 率', desc: '消除 AI 写作痕迹' },
  ]

  const intensityOptions: { value: 'light' | 'medium' | 'deep'; label: string; desc: string; pct: string; recommended?: boolean }[] = [
    { value: 'light', label: '轻度', desc: '保守改写，语义保真度高', pct: '~15% 替换' },
    { value: 'medium', label: '中度', desc: '平衡改写，效果与保真兼顾', pct: '~35% 替换', recommended: true },
    { value: 'deep', label: '深度', desc: '大幅改写，降重效果最强', pct: '~55% 替换' },
  ]

  return (
    <div className="lg:col-span-1 space-y-5">
      {/* File info bar */}
      <div className="bg-white rounded-2xl border border-pg-border p-5 slide-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-50 text-accent-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <p className="font-semibold text-pg-text text-sm">{fileName}</p>
            <p className="text-xs text-pg-muted">{paragraphCount} 段 · {charCount} 字符</p>
          </div>
        </div>
        <button onClick={onReset} className="text-xs text-pg-subtle hover:text-red-500 transition-colors self-start sm:self-center">重新上传</button>
      </div>

      {/* Mode selector */}
      <div className="bg-white rounded-2xl border border-pg-border p-5 slide-up">
        <h4 className="font-semibold text-pg-text mb-3 font-[family-name:var(--font-display)] text-sm">处理模式</h4>
        <div className="space-y-2">
          {modeOptions.map(opt => {
            const checked = mode === opt.value
            return (
              <label
                key={opt.value}
                className={`radio-card flex items-center gap-3 p-3 rounded-xl border ${checked ? 'border-brand-200 bg-brand-50/50' : 'border-pg-border'}`}
              >
                <input type="radio" name="mode" value={opt.value} checked={checked} onChange={() => setMode(opt.value)} className="accent-brand-600 w-4 h-4" />
                <div>
                  <div className="text-sm font-medium text-pg-text">{opt.label}</div>
                  <div className="text-xs text-pg-muted">{opt.desc}</div>
                </div>
              </label>
            )
          })}
        </div>
      </div>

      {/* Intensity selector */}
      <div className="bg-white rounded-2xl border border-pg-border p-5 slide-up" style={{ animationDelay: '0.05s' }}>
        <h4 className="font-semibold text-pg-text mb-3 font-[family-name:var(--font-display)] text-sm">降重强度</h4>
        <div className="space-y-2">
          {intensityOptions.map(opt => {
            const checked = intensity === opt.value
            return (
              <label
                key={opt.value}
                className={`radio-card flex items-center justify-between p-3 rounded-xl border ${checked ? 'border-brand-200 bg-brand-50/50' : 'border-pg-border'}`}
              >
                <div className="flex items-center gap-3">
                  <input type="radio" name="intensity" value={opt.value} checked={checked} onChange={() => setIntensity(opt.value)} className="accent-brand-600 w-4 h-4" />
                  <div>
                    <div className="text-sm font-medium text-pg-text">
                      {opt.label}
                      {opt.recommended && <span className="text-xs text-brand-600 font-normal ml-1">推荐</span>}
                    </div>
                    <div className="text-xs text-pg-muted">{opt.desc}</div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-md ${checked ? 'text-brand-600 bg-brand-50' : 'text-pg-muted bg-pg-surface'}`}>{opt.pct}</span>
              </label>
            )
          })}
        </div>
      </div>

      <button onClick={onStart} className="btn-primary w-full py-3.5 bg-brand-600 text-white rounded-2xl font-semibold text-base shadow-md">
        开始智能处理
      </button>
    </div>
  )
}
