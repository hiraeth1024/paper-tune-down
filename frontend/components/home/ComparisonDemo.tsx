'use client'

import { useState } from 'react'
import Image, { type StaticImageData } from 'next/image'
import beforeAigc from '@/assets/改写前-1.png'
import afterAigc from '@/assets/改写后-1.png'
import beforePara from '@/assets/改写前-2.png'
import afterPara from '@/assets/改写后-2.png'

const comparisons = [
  {
    before: beforeAigc,
    after: afterAigc,
    label: 'AIGC 检测率对比',
    beforeText: '81.3%',
    afterText: '24.79%',
    desc: (
      <>
        AIGC 总体疑似度从 <strong className="text-red-500">81.3%</strong> 降至{' '}
        <strong className="text-green-500">24.79%</strong>，降幅 <strong>69.5%</strong>
      </>
    ),
  },
  {
    before: beforePara,
    after: afterPara,
    label: '段落查重率对比',
    beforeText: '98.51%',
    afterText: '64.29%',
    desc: (
      <>
        单段最高疑似度从 <strong className="text-red-500">98.51%</strong> 降至{' '}
        <strong className="text-green-500">64.29%</strong>，降幅 <strong>34.7%</strong>
      </>
    ),
  },
]

function CompareImage({ src, alt, label, labelColor }: {
  src: StaticImageData
  alt: string
  label: string
  labelColor: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex-1 text-center">
        <span className={`inline-block text-xs px-2 py-0.5 rounded-md mb-2 font-medium ${labelColor}`}>
          {label}
        </span>
        <div
          className="relative cursor-pointer group rounded-lg border border-pg-border overflow-hidden"
          onClick={() => setOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter') setOpen(true) }}
        >
          <Image
            src={src}
            alt={alt}
            className="w-full group-hover:scale-105 transition-transform duration-300"
            placeholder="blur"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Lightbox modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setOpen(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            onClick={() => setOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <Image
            src={src}
            alt={alt}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
            placeholder="blur"
          />
        </div>
      )}
    </>
  )
}

export default function ComparisonDemo() {
  return (
    <section className="max-w-5xl mx-auto px-4 pb-20">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-pg-text mb-3 font-[family-name:var(--font-display)]">
        真实案例效果对比
      </h2>
      <p className="text-center text-pg-muted mb-10 text-sm">
        以下为实际论文处理前后的 AIGC 检测与段落查重结果对比，点击图片可放大查看
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {comparisons.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border border-pg-border p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-pg-text mb-4 text-center font-[family-name:var(--font-display)]">
              {item.label}
            </h3>

            <div className="flex items-start gap-2 mb-4">
              <CompareImage
                src={item.before}
                alt={`${item.label} 改写前`}
                label={`改写前 ${item.beforeText}`}
                labelColor="text-red-500 bg-red-50"
              />

              <div className="flex items-center pt-8">
                <svg className="w-5 h-5 text-brand-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              <CompareImage
                src={item.after}
                alt={`${item.label} 改写后`}
                label={`改写后 ${item.afterText}`}
                labelColor="text-green-500 bg-green-50"
              />
            </div>

            <p className="text-sm text-[#475569] leading-relaxed text-center">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
