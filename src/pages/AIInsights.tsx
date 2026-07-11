import { useMemo } from 'react'
import { format, subDays } from 'date-fns'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, AlertTriangle, Info } from 'lucide-react'
import { useWorkLogs } from '@/hooks/useWorkLogs'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { generateInsights } from '@/lib/aiInsights'
import { cn } from '@/lib/utils'

const toneStyles = {
  positive: { icon: TrendingUp, badge: 'text-success bg-success/10 border-success/20' },
  warning: { icon: AlertTriangle, badge: 'text-warning bg-warning/10 border-warning/20' },
  neutral: { icon: Info, badge: 'text-accent-light bg-accent-soft border-accent/20' },
} as const

export function AIInsights() {
  const profile = useAuthStore((s) => s.profile)
  const range = useMemo(
    () => ({ from: format(subDays(new Date(), 89), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') }),
    [],
  )
  const { logs, loading } = useWorkLogs(range)
  const insights = generateInsights(logs, profile?.daily_goal_minutes ?? 480)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-accent-soft text-accent-light">
          <Sparkles className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">AI Insights</h1>
          <p className="mt-1 text-[13px] text-secondary">
            Patterns and recommendations generated from your last 90 days of work.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {insights.map((insight, i) => {
            const tone = toneStyles[insight.tone]
            const Icon = tone.icon
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <Card className="h-full" hover>
                  <div className={cn('mb-3 inline-flex items-center justify-center rounded-xl border p-2', tone.badge)}>
                    <Icon className="size-4" />
                  </div>
                  <p className="text-[14.5px] font-semibold text-white">{insight.title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-secondary">{insight.message}</p>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
