export default function TipBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
      <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <div>
        <p className="text-sm font-medium text-amber-800">使用建议</p>
        <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">各查重系统数据库不同，结果可能有差异。建议先用廉价系统自检，修改后使用学校指定系统终检。本工具仅提供降重辅助，不保证通过任何特定查重系统。</p>
      </div>
    </div>
  )
}
