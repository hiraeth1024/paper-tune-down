import Image from 'next/image'
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

export default function ComparisonDemo() {
  return (
    <section className="max-w-5xl mx-auto px-4 pb-20">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-pg-text mb-3 font-[family-name:var(--font-display)]">
        真实案例效果对比
      </h2>
      <p className="text-center text-pg-muted mb-10 text-sm">
        以下为实际论文处理前后的 AIGC 检测与段落查重结果对比
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {comparisons.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border border-pg-border p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-pg-text mb-4 text-center font-[family-name:var(--font-display)]">
              {item.label}
            </h3>

            <div className="flex items-start gap-2 mb-4">
              <div className="flex-1 text-center">
                <span className="inline-block text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-md mb-2 font-medium">
                  改写前 {item.beforeText}
                </span>
                <Image
                  src={item.before}
                  alt={`${item.label} 改写前`}
                  className="rounded-lg border border-pg-border w-full"
                  placeholder="blur"
                />
              </div>

              <div className="flex items-center pt-8">
                <svg className="w-5 h-5 text-brand-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              <div className="flex-1 text-center">
                <span className="inline-block text-xs text-green-500 bg-green-50 px-2 py-0.5 rounded-md mb-2 font-medium">
                  改写后 {item.afterText}
                </span>
                <Image
                  src={item.after}
                  alt={`${item.label} 改写后`}
                  className="rounded-lg border border-pg-border w-full"
                  placeholder="blur"
                />
              </div>
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
