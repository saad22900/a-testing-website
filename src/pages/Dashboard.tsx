import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, subDays } from 'date-fns'
import { Clock, CheckCircle2, Flame, TrendingUp, ArrowRight, Sparkles, Plus } from 'lucide-react'
import { useWorkLogs } from '@/hooks/useWorkLogs'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatCard } from '@/components/dashboard/StatCard'
import { CategoryBreakdownChart } from '@/components/charts/CategoryBreakdownChart'
import { ProductivityTrendChart } from '@/components/charts/ProductivityTrendChart'
import { CategoryPill } from '@/components/work/CategoryPill'
import { EmptyState } from '@/components/common/EmptyState'
import {
  categoryBreakdown,
  dailyTotals,
  totalMinutes,
  weeklyComparison,
} from '@/lib/analytics'
import { generateInsights } from '@/lib/aiInsights'
import { formatDuration, greeting } from '@/lib/utils'

export function Dashboard() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const setQuickAddOpen = useUIStore((s) => s.setQuickAddOpen)

  const range = useMemo(
    () => ({ from: format(subDays(new Date(), 89), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') }),
    [],
  )
  const { logs, loading } = useWorkLogs(range)

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayLogs = logs.filter((l) => l.work_date === today)
  const todayMinutes = totalMinutes(todayLogs)
  const todayCount = todayLogs.filter((l) => l.status === 'completed').length

  const wc = weeklyComparison(logs)
  const trend = dailyTotals(logs, subDays(new Date(), 6), new Date())
  const breakdown = categoryBreakdown(logs.filter((l) => l.status === 'completed'))
  const insights = generateInsights(logs, profile?.daily_goal_minutes ?? 480).slice(0, 2)

  const uniqueDates = Array.from(new Set(logs.filter((l) => l.status === 'completed').map((l) => l.work_date)))
  let streak = 0
  const sorted = [...uniqueDates].sort().reverse()
  let cursor = new Date()
  for (const d of sorted) {
    const diff = Math.round((cursor.getTime() - new Date(d).getTime()) / 86400000)
    if (diff <= 1) {
      streak += 1
      cursor = new Date(d)
    } else break
  }

  const recent = logs.slice(0, 6)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {greeting()}, {profile?.full_name?.split(' ')[0] || 'there'}
          </h1>
          <p className="mt-1 text-[13px] text-secondary">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Button onClick={() => setQuickAddOpen(true)}>
          <Plus className="size-4" /> Quick Add Work
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[124px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Logged today" value={todayMinutes} suffix="m" icon={<Clock className="size-4.5" />} delay={0} />
          <StatCard
            label="Tasks completed today"
            value={todayCount}
            icon={<CheckCircle2 className="size-4.5" />}
            delay={0.05}
          />
          <StatCard
            label="This week"
            value={wc.currentMinutes}
            suffix="m"
            icon={<TrendingUp className="size-4.5" />}
            trend={wc.deltaPercent}
            delay={0.1}
          />
          <StatCard label="Logging streak" value={streak} suffix=" days" icon={<Flame className="size-4.5" />} delay={0.15} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Productivity trend</CardTitle>
            <Badge variant="outline">Last 7 days</Badge>
          </CardHeader>
          {loading ? <Skeleton className="h-[240px]" /> : <ProductivityTrendChart data={trend} />}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time by category</CardTitle>
          </CardHeader>
          {loading ? <Skeleton className="h-[240px]" /> : <CategoryBreakdownChart data={breakdown} />}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <button
              onClick={() => navigate('/timeline')}
              className="flex items-center gap-1 text-[12.5px] font-medium text-accent-light transition-colors hover:text-accent"
            >
              View timeline <ArrowRight className="size-3.5" />
            </button>
          </CardHeader>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <EmptyState
              icon={<Clock className="size-5" />}
              title="No work logged yet"
              description="Use Quick Add to log your first entry."
              action={
                <Button size="sm" onClick={() => setQuickAddOpen(true)}>
                  <Plus className="size-4" /> Add work
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-border">
              {recent.map((log) => (
                <div key={log.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium text-white">{log.title}</p>
                    <p className="mt-0.5 text-xs text-secondary">
                      {format(new Date(log.work_date), 'MMM d')} · {formatDuration(log.duration_minutes)}
                    </p>
                  </div>
                  <CategoryPill category={log.category} className="shrink-0" />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <Sparkles className="size-4 text-accent-light" /> AI Insights
            </CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {insights.map((insight) => (
              <div key={insight.id} className="rounded-xl border border-border bg-surface p-3.5">
                <p className="text-[13px] font-medium text-white">{insight.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-secondary">{insight.message}</p>
              </div>
            ))}
            <button
              onClick={() => navigate('/insights')}
              className="flex items-center gap-1 text-[12.5px] font-medium text-accent-light transition-colors hover:text-accent"
            >
              View all insights <ArrowRight className="size-3.5" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
