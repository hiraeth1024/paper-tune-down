import type { Metadata } from 'next'
import { Crimson_Pro, Atkinson_Hyperlegible } from 'next/font/google'
import Navbar from '@/components/Navbar'
import ToastProvider from '@/components/ToastProvider'
import Footer from '@/components/Footer'
import './globals.css'

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
})

const atkinson = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'PaperTune — 论文降重助手',
  description: '上传 .docx 格式论文，智能识别高重复段落，规则引擎精准改写，保留学术风格的同时有效降低查重率。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className={`${crimsonPro.variable} ${atkinson.variable}`}>
      <body className="bg-pg-bg text-pg-text min-h-screen antialiased font-[family-name:var(--font-body)] flex flex-col">
        <ToastProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  )
}
