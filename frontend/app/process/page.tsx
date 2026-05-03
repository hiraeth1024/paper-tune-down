'use client'

import { useState, useRef, useCallback, type DragEvent } from 'react'
import Link from 'next/link'
import StrategyPanel from '@/components/process/StrategyPanel'
import DocPreview from '@/components/process/DocPreview'
import ResultsView from '@/components/process/ResultsView'
import { useToast } from '@/components/ToastProvider'
import { mockParagraphs } from '@/lib/data'

type Step = 'upload' | 'strategy' | 'results'

export default function ProcessPage() {
  const [step, setStep] = useState<Step>('upload')
  const [fileName, setFileName] = useState('')
  const [paragraphs, setParagraphs] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.docx')) {
      showToast('仅支持 .docx 格式文件')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      showToast('文件大小超过 20MB 限制')
      return
    }
    setFileName(file.name)
    setParagraphs(mockParagraphs)
    setStep('strategy')
  }, [showToast])

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave() {
    setDragOver(false)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) {
      processFile(e.dataTransfer.files[0])
    }
  }

  function handleFileSelect() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      processFile(e.target.files[0])
    }
  }

  function handleReset() {
    setStep('upload')
    setFileName('')
    setParagraphs([])
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 fade-in">
        <div>
          <h1 className="text-2xl font-bold text-pg-text font-[family-name:var(--font-display)]">智能处理</h1>
          <p className="text-sm text-pg-muted mt-0.5">上传论文，选择策略，一键改写</p>
        </div>
        <Link href="/" className="px-4 py-2 text-sm font-medium text-[#475569] bg-white border border-pg-border rounded-xl hover:bg-pg-surface transition-colors inline-block w-fit" onClick={handleReset}>
          返回首页
        </Link>
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="fade-in">
          <div className="max-w-xl mx-auto">
            <div
              className={`file-drop bg-white border-2 border-dashed rounded-3xl p-14 sm:p-16 text-center cursor-pointer transition-colors ${dragOver ? 'border-brand-600 bg-brand-50 scale-[1.01]' : 'border-brand-200 hover:border-brand-400'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleFileSelect}
            >
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-pg-text mb-1.5 font-[family-name:var(--font-display)]">拖拽论文文件到此处</h3>
              <p className="text-sm text-pg-muted mb-5">或点击选择文件 · 仅支持 .docx · 最大 20MB</p>
              <button className="btn-primary px-5 py-3 bg-brand-600 text-white rounded-xl font-medium text-sm cursor-pointer shadow-md" onClick={e => { e.stopPropagation(); handleFileSelect() }}>
                选择文件
              </button>
              <input ref={fileInputRef} type="file" accept=".docx" className="hidden" onChange={handleFileChange} />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Strategy */}
      {step === 'strategy' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <StrategyPanel
            fileName={fileName}
            paragraphCount={paragraphs.length}
            charCount={paragraphs.reduce((s, p) => s + p.length, 0)}
            onReset={handleReset}
            onStart={() => setStep('results')}
          />
          <div className="lg:col-span-2">
            <DocPreview paragraphs={paragraphs} />
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 'results' && (
        <ResultsView paragraphs={paragraphs} />
      )}
    </div>
  )
}
