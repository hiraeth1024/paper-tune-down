'use client'

import { useState } from 'react'
import { qaData } from '@/lib/data'

export default function QASection() {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set())

  function toggle(idx: number) {
    setOpenIndices(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  return (
    <section className="border-t border-pg-border">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-pg-text mb-3 font-[family-name:var(--font-display)]">常见问题</h2>
        <p className="text-center text-pg-muted mb-10 text-sm">关于降重和 AI 检测，你关心的问题都在这里</p>
        <div className="space-y-3">
          {qaData.map((item, i) => {
            const open = openIndices.has(i)
            return (
              <div
                key={i}
                className={`qa-item bg-white rounded-2xl border shadow-sm cursor-pointer ${open ? 'border-brand-600 bg-[#f8fafc]' : 'border-pg-border'}`}
                onClick={() => toggle(i)}
              >
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm font-medium text-pg-text pr-4">{item.q}</span>
                  <svg
                    className={`w-5 h-5 text-pg-subtle shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {open && (
                  <div className="px-5 pb-4" style={{ animation: 'qaIn 0.3s ease' }}>
                    <p className="text-sm text-[#475569] leading-relaxed border-t border-pg-border pt-3">{item.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
