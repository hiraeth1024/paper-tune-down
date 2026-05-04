'use client'

import { useState, useRef, useCallback, type DragEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import StrategyPanel from '@/components/process/StrategyPanel'
import DocPreview from '@/components/process/DocPreview'
import ResultsView from '@/components/process/ResultsView'
import { useToast } from '@/components/ToastProvider'
import { useAuth } from '@/components/AuthProvider'
import { parseDocx } from '@/lib/docx-parser'

type Step = 'upload' | 'strategy' | 'results'

export default function ProcessPage() {
  const [step, setStep] = useState<Step>('upload')
  const [fileName, setFileName] = useState('')
  const [paragraphs, setParagraphs] = useState<string[]>([])
  const [parsing, setParsing] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  function guardAuth(): boolean {
    if (!isAuthenticated) {
      router.push('/login?redirect=/process')
      return false
    }
    return true
  }

  const processFile = useCallback(async (file: File) => {
    if (!guardAuth()) return
    if (!file.name.endsWith('.docx')) {
      showToast('仅支持 .docx 格式文件')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      showToast('文件大小超过 20MB 限制')
      return
    }
    setFileName(file.name)
    setParsing(true)
    try {
      const parsed = await parseDocx(file)
      if (parsed.length === 0) {
        showToast('未能从文件中提取到有效段落，请检查文件内容')
        setParsing(false)
        return
      }
      setParagraphs(parsed)
      setStep('strategy')
    } catch {
      showToast('文件解析失败，请确认上传的是有效的 .docx 文件')
    } finally {
      setParsing(false)
    }
  }, [showToast, isAuthenticated])

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
          {parsing && (
            <div className="max-w-xl mx-auto mb-5 bg-white rounded-2xl border border-brand-200 p-4 flex items-center gap-4">
              <div className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-600 rounded-full animate-spin shrink-0" />
              <div>
                <p className="text-sm font-medium text-pg-text">正在解析文件...</p>
                <p className="text-xs text-pg-muted">{fileName}</p>
              </div>
            </div>
          )}
          {!isAuthenticated && (
            <div className="max-w-xl mx-auto mb-5 bg-white rounded-2xl border border-amber-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800">上传论文需要先登录</p>
                  <p className="text-xs text-amber-600">登录后即可免费使用智能降重功能</p>
                </div>
              </div>
              <Link href="/login?redirect=/process" className="shrink-0 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 transition-colors">
                去登录
              </Link>
            </div>
          )}
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
            onStart={() => { if (guardAuth()) setStep('results') }}
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
