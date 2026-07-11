import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { AnimatedCounter } from '@/components/common/AnimatedCounter'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: number
  suffix?: string
  decimals?: number
  icon: ReactNode
  delay?: number
  trend?: number
}

export function StatCard({ label, value, suffix = '', decimals = 0, icon, delay = 0, trend }: StatCardProps) {
  return (
    <Card hover delay={delay} className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium text-secondary">{label}</p>
          <p className="mt-2 text-[26px] font-semibold tracking-tight text-white">
            <AnimatedCounter value={value} suffix={suffix} decimals={decimals} />
          </p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
          {icon}
        </div>
      </div>
      {typeof trend === 'number' && (
        <div
          className={cn(
            'mt-3 inline-flex items-center gap-1 text-[12px] font-medium',
            trend >= 0 ? 'text-success' : 'text-danger',
          )}
        >
          {trend >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
          {Math.abs(trend).toFixed(0)}% vs last week
        </div>
      )}
    </Card>
  )
}
