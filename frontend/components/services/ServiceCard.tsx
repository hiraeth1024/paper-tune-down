import type { CheckService } from '@/lib/data'

const tagColorMap: Record<string, string> = {
  red: 'bg-red-50 text-red-600',
  blue: 'bg-blue-50 text-blue-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  green: 'bg-green-50 text-green-600',
  teal: 'bg-teal-50 text-teal-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
  gray: 'bg-pg-surface text-[#475569]',
}

const btnStyles: Record<string, string> = {
  red: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-200 shadow-lg',
  blue: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-200 shadow-lg',
  indigo: 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-indigo-200 shadow-lg',
  green: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-200 shadow-lg',
  teal: 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-teal-200 shadow-lg',
  purple: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-purple-200 shadow-lg',
  orange: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-200 shadow-lg',
  gray: 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white shadow-slate-200 shadow-lg',
}

interface Props {
  service: CheckService
  index: number
}

export default function ServiceCard({ service, index }: Props) {
  const priceLabel = service.price.split('·')[0] || service.price

  return (
    <div className="card bg-white rounded-2xl p-5 border border-pg-border shadow-sm flex flex-col" style={{ animationDelay: `${index * 0.04}s` }}>
      <div className="flex items-start justify-between mb-2.5">
        <h3 className="font-semibold text-pg-text text-sm">{service.name}</h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-2 ${tagColorMap[service.color]}`}>{priceLabel}</span>
      </div>
      <p className="text-xs text-pg-muted leading-relaxed mb-3 flex-1">{service.desc}</p>
      <div className="flex flex-wrap gap-1 mb-4">
        {service.tags.map(t => (
          <span key={t} className="text-xs bg-pg-surface text-pg-muted px-2 py-0.5 rounded-md">{t}</span>
        ))}
      </div>
      <a
        href={service.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`block w-full text-center py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-100 ${btnStyles[service.color]}`}
      >
        访问平台
        <svg className="w-4 h-4 inline ml-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
      </a>
    </div>
  )
}
