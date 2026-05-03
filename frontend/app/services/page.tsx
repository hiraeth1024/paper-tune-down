import TipBanner from '@/components/services/TipBanner'
import ServiceCard from '@/components/services/ServiceCard'
import { services } from '@/lib/data'

export default function ServicesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 fade-in">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-pg-text font-[family-name:var(--font-display)]">查重平台导航</h1>
        <p className="text-pg-muted mt-1.5 text-sm">聚合主流查重平台，对比数据库覆盖、价格和适用场景</p>
      </div>

      <TipBanner />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {services.map((s, i) => (
          <ServiceCard key={i} service={s} index={i} />
        ))}
      </div>
    </div>
  )
}
