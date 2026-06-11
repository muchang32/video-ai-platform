import type { ReactNode } from 'react'

interface Props {
  title: string
  icon?: string
  children: ReactNode
  className?: string
}

export function ResultCard({ title, icon, children, className = '' }: Props) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm fade-slide-up ${className}`}>
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        {icon && <span className="text-lg">{icon}</span>}
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}
