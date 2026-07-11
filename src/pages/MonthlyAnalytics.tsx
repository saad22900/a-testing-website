import { useMemo } from 'react'
import { format, startOfMonth, endOfMonth, subMonths, eachWeekOfInterval } from 'date-fns'
import { Clock, CheckCircle2, Hourglass, Trophy } from 'lucide-react'
import { useWorkLogs } from '@/hooks/useWorkLogs'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatCard } from '@/components/dashboard/StatCard'
import { CategoryBreakdownChart } from '@/components/charts/CategoryBreakdownChart'
import { ComparisonChart } from '@/components/charts/ComparisonChart'
import { ProductivityTrendChart } from '@/components/charts/ProductivityTrendChart'
import {
  averageDuration,
  categoryBreakdown,
  dailyTotals,
  longestTask,
  mostCommonTask,
  monthlyComparison,
} from '@/lib/analytics'
import { formatDuration } from '@/lib/utils'

export function MonthlyAnalytics() {
  const range = useMemo(
    () => ({
      from: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
      to: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    }),
    [],
  )
  const { logs, loading } = useWorkLogs(range)
  const completed = logs.filter((l) => l.status === 'completed')

  const monthStart = startOfMonth(new Date())
  const monthEnd = endOfMonth(new Date())
  const thisMonthLogs = completed.filter((l) => {
    const d = new Date(l.work_date)
    return d >= monthStart && d <= monthEnd
  })

  const mc = monthlyComparison(logs)
  const breakdown = categoryBreakdown(thisMonthLogs)
  const longest = longestTask(thisMonthLogs)
  const common = mostCommonTask(thisMonthLogs)
  const avg = averageDuration(thisMonthLogs)
  const trend = dailyTotals(completed, monthStart, monthEnd)

  const weekStarts = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 })
  const prevMonthStart = startOfMonth(subMonths(new Date(), 1))
  const prevWeekStarts = eachWeekOfInterval(
    { start: prevMonthStart, end: endOfMonth(prevMonthStart) },
    { weekStartsOn: 1 },
  )
  const comparisonData = weekStarts.map((ws, i) => {
    const weekEnd = new Date(ws)
    weekEnd.setDate(weekEnd.getDate() + 6)
    const current = thisMonthLogs
      .filter((l) => {
        const d = new Date(l.work_date)
        return d >= ws && d <= weekEnd
      })
      .reduce((s, l) => s + l.duration_minutes, 0)

    const prevWs = prevWeekStarts[i]
    let previous = 0
    if (prevWs) {
      const prevWeekEnd = new Date(prevWs)
      prevWeekEnd.setDate(prevWeekEnd.getDate() + 6)
      previous = completed
        .filter((l) => {
          const d = new Date(l.work_date)
          return d >= prevWs && d <= prevWeekEnd
        })
        .reduce((s, l) => s + l.duration_minutes, 0)
    }
    return { label: `Week ${i + 1}`, current, previous }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Monthly Analytics</h1>
        <p className="mt-1 text-[13px] text-secondary">{format(new Date(), 'MMMM yyyy')}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[124px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total time" value={mc.currentMinutes} suffix="m" icon={<Clock className="size-4.5" />} trend={mc.deltaPercent} />
          <StatCard label="Tasks completed" value={mc.currentCount} icon={<CheckCircle2 className="size-4.5" />} delay={0.05} />
          <StatCard label="Avg. task duration" value={Math.round(avg)} suffix="m" icon={<Hourglass className="size-4.5" />} delay={0.1} />
          <StatCard label="Longest task" value={longest?.duration_minutes ?? 0} suffix="m" icon={<Trophy className="size-4.5" />} delay={0.15} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Daily productivity this month</CardTitle>
        </CardHeader>
        {loading ? <Skeleton className="h-[240px]" /> : <ProductivityTrendChart data={trend} />}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Month-over-month by week</CardTitle>
        </CardHeader>
        {loading ? <Skeleton className="h-[220px]" /> : <ComparisonChart currentLabel="This month" previousLabel="Last month" data={comparisonData} />}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Time by category</CardTitle>
          </CardHeader>
          {loading ? <Skeleton className="h-[200px]" /> : <CategoryBreakdownChart data={breakdown} />}
        </Card>

        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Highlights</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-[12px] text-secondary">Most common task</p>
              <p className="mt-1 text-[14px] font-medium text-white">{common?.title ?? '—'}</p>
              {common && (
                <Badge variant="accent" className="mt-2">
                  Logged {common.count}×
                </Badge>
              )}
            </div>
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-[12px] text-secondary">Longest single task</p>
              <p className="mt-1 text-[14px] font-medium text-white">{longest?.title ?? '—'}</p>
              {longest && (
                <Badge variant="outline" className="mt-2">
                  {formatDuration(longest.duration_minutes)}
                </Badge>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
