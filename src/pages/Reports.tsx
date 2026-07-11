import { useMemo, useState } from 'react'
import { format, startOfMonth, startOfWeek, subDays } from 'date-fns'
import { Download, FileBarChart } from 'lucide-react'
import { useWorkLogs } from '@/hooks/useWorkLogs'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { CategoryBreakdownChart } from '@/components/charts/CategoryBreakdownChart'
import { CategoryPill } from '@/components/work/CategoryPill'
import { EmptyState } from '@/components/common/EmptyState'
import { categoryBreakdown, averageDuration, totalMinutes } from '@/lib/analytics'
import { workLogsToCsv, downloadCsv } from '@/lib/csv'
import { formatDuration } from '@/lib/utils'

const presets = {
  week: 'This week',
  month: 'This month',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
} as const

type Preset = keyof typeof presets

export function Reports() {
  const [preset, setPreset] = useState<Preset>('30d')

  const range = useMemo(() => {
    const today = new Date()
    const to = format(today, 'yyyy-MM-dd')
    if (preset === 'week') return { from: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'), to }
    if (preset === 'month') return { from: format(startOfMonth(today), 'yyyy-MM-dd'), to }
    if (preset === '30d') return { from: format(subDays(today, 29), 'yyyy-MM-dd'), to }
    return { from: format(subDays(today, 89), 'yyyy-MM-dd'), to }
  }, [preset])

  const { logs, loading } = useWorkLogs(range)
  const completed = logs.filter((l) => l.status === 'completed')
  const breakdown = categoryBreakdown(completed)

  function handleExport() {
    const csv = workLogsToCsv(completed)
    downloadCsv(`hr-work-report-${range.from}-to-${range.to}.csv`, csv)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Reports</h1>
          <p className="mt-1 text-[13px] text-secondary">Summarize and export your logged work.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={preset} onChange={(e) => setPreset(e.target.value as Preset)} className="w-40">
            {Object.entries(presets).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Button variant="secondary" onClick={handleExport} disabled={completed.length === 0}>
            <Download className="size-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-[13px] text-secondary">Total logged</p>
          <p className="mt-2 text-2xl font-semibold text-white">{formatDuration(totalMinutes(completed))}</p>
        </Card>
        <Card delay={0.05}>
          <p className="text-[13px] text-secondary">Tasks completed</p>
          <p className="mt-2 text-2xl font-semibold text-white">{completed.length}</p>
        </Card>
        <Card delay={0.1}>
          <p className="text-[13px] text-secondary">Avg. task duration</p>
          <p className="mt-2 text-2xl font-semibold text-white">{Math.round(averageDuration(completed))}m</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Breakdown</CardTitle>
          </CardHeader>
          {loading ? <Skeleton className="h-[200px]" /> : <CategoryBreakdownChart data={breakdown} />}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Entries ({completed.length})</CardTitle>
          </CardHeader>
          {loading ? (
            <Skeleton className="h-[300px]" />
          ) : completed.length === 0 ? (
            <EmptyState icon={<FileBarChart className="size-5" />} title="No entries in this range" />
          ) : (
            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {completed.map((log) => (
                <div key={log.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3.5 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-white">{log.title}</p>
                    <p className="mt-0.5 text-[11px] text-secondary">{format(new Date(log.work_date), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <CategoryPill category={log.category} />
                    <span className="text-[12px] font-medium text-secondary">{formatDuration(log.duration_minutes)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
