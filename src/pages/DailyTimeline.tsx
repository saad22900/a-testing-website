import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { format, addDays, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, ListTree, Plus } from 'lucide-react'
import { useWorkLogs } from '@/hooks/useWorkLogs'
import { useUIStore } from '@/store/uiStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { WorkLogItem } from '@/components/work/WorkLogItem'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDuration } from '@/lib/utils'
import { totalMinutes } from '@/lib/analytics'

export function DailyTimeline() {
  const [date, setDate] = useState(new Date())
  const dateStr = format(date, 'yyyy-MM-dd')
  const { logs, loading, deleteLog } = useWorkLogs({ from: dateStr, to: dateStr })
  const setQuickAddOpen = useUIStore((s) => s.setQuickAddOpen)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const sorted = [...logs].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deleteLog(id)
    setDeletingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Daily Timeline</h1>
          <p className="mt-1 text-[13px] text-secondary">A chronological view of your logged work.</p>
        </div>
        <Button onClick={() => setQuickAddOpen(true)}>
          <Plus className="size-4" /> Quick Add
        </Button>
      </div>

      <Card>
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => setDate((d) => addDays(d, -1))}
            className="flex size-8 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-white/5 hover:text-white"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="text-center">
            <p className="text-[15px] font-semibold text-white">{format(date, 'EEEE, MMMM d')}</p>
            <p className="text-xs text-secondary">
              {isToday(date) ? 'Today' : format(date, 'yyyy')} · {formatDuration(totalMinutes(logs))} logged
            </p>
          </div>
          <button
            onClick={() => setDate((d) => addDays(d, 1))}
            className="flex size-8 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-white/5 hover:text-white"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={<ListTree className="size-5" />}
            title="Nothing logged for this day"
            description="Switch days with the arrows above, or add a new entry."
            action={
              <Button size="sm" onClick={() => setQuickAddOpen(true)}>
                <Plus className="size-4" /> Add work
              </Button>
            }
          />
        ) : (
          <div className="space-y-1">
            <AnimatePresence initial={false}>
              {sorted.map((log) => (
                <WorkLogItem key={log.id} log={log} onDelete={handleDelete} deleting={deletingId === log.id} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </Card>
    </div>
  )
}
