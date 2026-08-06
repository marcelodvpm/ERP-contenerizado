import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  sublabel?: string
  icon?: ReactNode
}

export function StatCard({ label, value, sublabel, icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-graphite-200 bg-canvas-raised p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-graphite-400">{label}</p>
        {icon && <span className="text-copper-500">{icon}</span>}
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold text-graphite-900">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-graphite-400">{sublabel}</p>}
    </div>
  )
}
