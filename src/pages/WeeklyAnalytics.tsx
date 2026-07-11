import { useMemo } from 'react'
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns'
import { Clock, CheckCircle2, Hourglass, Trophy } from 'lucide-react'
import { useWorkLogs } from '@/hooks/useWorkLogs'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatCard } from '@/components/dashboard/StatCard'
import { CategoryBreakdownChart } from '@/components/charts/CategoryBreakdownChart'
import { ComparisonChart } from '@/components/charts/ComparisonChart'
import { HeatmapChart } from '@/components/charts/HeatmapChart'
import {
  averageDuration,
  categoryBreakdown,
  heatmapData,
  longestTask,
  mostCommonTask,
  weeklyComparison,
} from '@/lib/analytics'
import { formatDuration } from '@/lib/utils'

export function WeeklyAnalytics() {
  const range = useMemo(
    () => ({
      from: format(startOfWeek(subWeeks(new Date(), 8), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      to: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    }),
    [],
  )
  const { logs, loading } = useWorkLogs(range)
  const completed = logs.filter((l) => l.status === 'completed')

  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const thisWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
  const thisWeekLogs = completed.filter((l) => {
    const d = new Date(l.work_date)
    return d >= thisWeekStart && d <= thisWeekEnd
  })

  const wc = weeklyComparison(logs)
  const breakdown = categoryBreakdown(thisWeekLogs)
  const longest = longestTask(thisWeekLogs)
  const common = mostCommonTask(thisWeekLogs)
  const avg = averageDuration(thisWeekLogs)
  const heatmap = heatmapData(logs, 18)

  const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const comparisonData = weekdayLabels.map((label, i) => {
    const currentDay = new Date(thisWeekStart)
    currentDay.setDate(currentDay.getDate() + i)
    const prevWeekStart = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 })
    const prevDay = new Date(prevWeekStart)
    prevDay.setDate(prevDay.getDate() + i)
    const currentKey = format(currentDay, 'yyyy-MM-dd')
    const prevKey = format(prevDay, 'yyyy-MM-dd')
    const current = completed.filter((l) => l.work_date === currentKey).reduce((s, l) => s + l.duration_minutes, 0)
    const previous = completed.filter((l) => l.work_date === prevKey).reduce((s, l) => s + l.duration_minutes, 0)
    return { label, current, previous }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Weekly Analytics</h1>
        <p className="mt-1 text-[13px] text-secondary">
          {format(thisWeekStart, 'MMM d')} – {format(thisWeekEnd, 'MMM d, yyyy')}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[124px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total time" value={wc.currentMinutes} suffix="m" icon={<Clock className="size-4.5" />} trend={wc.deltaPercent} />
          <StatCard label="Tasks completed" value={wc.currentCount} icon={<CheckCircle2 className="size-4.5" />} delay={0.05} />
          <StatCard label="Avg. task duration" value={Math.round(avg)} suffix="m" icon={<Hourglass className="size-4.5" />} delay={0.1} />
          <StatCard label="Longest task" value={longest?.duration_minutes ?? 0} suffix="m" icon={<Trophy className="size-4.5" />} delay={0.15} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Week-over-week comparison</CardTitle>
        </CardHeader>
        {loading ? <Skeleton className="h-[220px]" /> : <ComparisonChart currentLabel="This week" previousLabel="Last week" data={comparisonData} />}
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

      <Card>
        <CardHeader>
          <CardTitle>Activity heatmap</CardTitle>
          <Badge variant="outline">Last 18 weeks</Badge>
        </CardHeader>
        {loading ? <Skeleton className="h-[140px]" /> : <HeatmapChart data={heatmap} />}
      </Card>
    </div>
  )
}
