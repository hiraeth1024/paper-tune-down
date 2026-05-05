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
