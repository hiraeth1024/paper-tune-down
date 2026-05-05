# 首页真实案例对比展示 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 首页新增真实案例对比区域，展示 AIGC 率和段落疑似度前后对比截图

**Architecture:** 新建 ComparisonDemo 组件，在 page.tsx 中 HowItWorks 和 QASection 之间插入

**Tech Stack:** Next.js 14 + TypeScript + Tailwind CSS

---

### Task 1: 创建 ComparisonDemo 组件

**Files:**
- Create: `frontend/components/home/ComparisonDemo.tsx`

- [ ] **Step 1: 创建组件文件**

```tsx
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

            {/* Before / After images side by side */}
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
```

- [ ] **Step 2: 验证 TS 编译**

```bash
cd frontend && npx tsc --noEmit --pretty 2>&1 | head -10
```

Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add frontend/components/home/ComparisonDemo.tsx
git commit -m "feat: 首页新增真实案例对比组件，展示AIGC率和段落疑似度前后效果"
```

---

### Task 2: 在首页插入 ComparisonDemo

**Files:**
- Modify: `frontend/app/(main)/page.tsx`

- [ ] **Step 1: 导入并插入组件**

在 `page.tsx` 中：

```tsx
import HeroSection from '@/components/home/HeroSection'
import PreviewWindow from '@/components/home/PreviewWindow'
import Features from '@/components/home/Features'
import HowItWorks from '@/components/home/HowItWorks'
import ComparisonDemo from '@/components/home/ComparisonDemo'
import QASection from '@/components/home/QASection'

export default function Home() {
  return (
    <>
      <HeroSection />
      <PreviewWindow />
      <Features />
      <HowItWorks />
      <ComparisonDemo />
      <QASection />
    </>
  )
}
```

- [ ] **Step 2: 验证 TS 编译**

```bash
cd frontend && npx tsc --noEmit --pretty 2>&1 | head -10
```

Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add frontend/app/\(main\)/page.tsx
git commit -m "feat: 首页插入真实案例对比区域"
```

---

### Task 3: 浏览器验证

- [ ] **Step 1: 打开首页确认**

打开 http://localhost:3000，确认：
1. 「三步完成降重」下方出现「真实案例效果对比」区域
2. 左右两卡分别展示 AIGC 和段落查重对比
3. 图片清晰加载（Next.js Image 优化）
4. 移动端两卡上下堆叠
