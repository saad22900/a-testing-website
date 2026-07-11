import { useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useWorkLogs } from '@/hooks/useWorkLogs'
import { Card } from '@/components/ui/Card'
import { WorkLogItem } from '@/components/work/WorkLogItem'
import { EmptyState } from '@/components/common/EmptyState'
import { CalendarDays } from 'lucide-react'
import { cn, formatDuration } from '@/lib/utils'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function CalendarPage() {
  const [month, setMonth] = useState(new Date())
  const [selected, setSelected] = useState<Date | null>(null)

  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const range = useMemo(
    () => ({ from: format(gridStart, 'yyyy-MM-dd'), to: format(gridEnd, 'yyyy-MM-dd') }),
    [gridStart, gridEnd],
  )
  const { logs, loading, deleteLog } = useWorkLogs(range)

  const byDate = new Map<string, typeof logs>()
  for (const log of logs) {
    const key = log.work_date
    byDate.set(key, [...(byDate.get(key) ?? []), log])
  }

  const selectedLogs = selected ? byDate.get(format(selected, 'yyyy-MM-dd')) ?? [] : []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Calendar</h1>
          <p className="mt-1 text-[13px] text-secondary">See your logged work across the month.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonth((m) => subMonths(m, 1))}
            className="flex size-8 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-white/5 hover:text-white"
          >
            <ChevronLeft className="size-4" />
          </button>
          <p className="w-36 text-center text-[14px] font-semibold text-white">{format(month, 'MMMM yyyy')}</p>
          <button
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="flex size-8 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-white/5 hover:text-white"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <Card className={cn(loading && 'opacity-60')}>
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl bg-border">
          {WEEKDAYS.map((d) => (
            <div key={d} className="bg-surface py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted">
              {d}
            </div>
          ))}
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const dayLogs = byDate.get(key) ?? []
            const minutes = dayLogs.reduce((sum, l) => sum + l.duration_minutes, 0)
            const inMonth = isSameMonth(day, month)
            return (
              <button
                key={key}
                onClick={() => setSelected(day)}
                className={cn(
                  'flex min-h-[92px] flex-col items-start gap-1.5 bg-card p-2 text-left transition-colors hover:bg-card-hover',
                  !inMonth && 'opacity-40',
                )}
              >
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full text-[12px] font-medium',
                    isToday(day) ? 'bg-accent text-white' : 'text-secondary',
                  )}
                >
                  {format(day, 'd')}
                </span>
                {minutes > 0 && (
                  <span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium text-accent-light">
                    {formatDuration(minutes)}
                  </span>
                )}
                {dayLogs.length > 1 && (
                  <span className="text-[10px] text-muted">{dayLogs.length} entries</span>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              className="glass relative z-10 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{format(selected, 'EEEE, MMMM d, yyyy')}</h2>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-1.5 text-secondary hover:bg-white/5 hover:text-white"
                >
                  <X className="size-4.5" />
                </button>
              </div>
              {selectedLogs.length === 0 ? (
                <EmptyState icon={<CalendarDays className="size-5" />} title="Nothing logged this day" />
              ) : (
                <div className="space-y-1">
                  {selectedLogs.map((log) => (
                    <WorkLogItem key={log.id} log={log} onDelete={deleteLog} />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
