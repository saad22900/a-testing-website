import { useState } from 'react'
import { format } from 'date-fns'
import { Play, Square, Trash2, Timer as TimerIcon } from 'lucide-react'
import { useTaskTimer } from '@/hooks/useTaskTimer'
import { useCategories } from '@/hooks/useCategories'
import { useWorkLogs } from '@/hooks/useWorkLogs'
import { useUIStore } from '@/store/uiStore'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { WorkLogItem } from '@/components/work/WorkLogItem'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDurationClock } from '@/lib/utils'

export function TaskTimerPage() {
  const { activeLog, elapsedSeconds, start, stop, discard } = useTaskTimer()
  const { categories } = useCategories()
  const today = format(new Date(), 'yyyy-MM-dd')
  const { logs, loading, deleteLog } = useWorkLogs({ from: today, to: today })
  const pushToast = useUIStore((s) => s.pushToast)

  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [starting, setStarting] = useState(false)
  const [stopping, setStopping] = useState(false)

  const completedToday = logs.filter((l) => l.status === 'completed')

  async function handleStart(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setStarting(true)
    const { error } = await start(title.trim(), categoryId || null)
    setStarting(false)
    if (error) pushToast({ title: 'Could not start timer', description: error, variant: 'error' })
    else setTitle('')
  }

  async function handleStop() {
    setStopping(true)
    const { error } = await stop()
    setStopping(false)
    if (error) pushToast({ title: 'Could not stop timer', description: error, variant: 'error' })
    else pushToast({ title: 'Task logged', description: activeLog?.title, variant: 'success' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Task Timer</h1>
        <p className="mt-1 text-[13px] text-secondary">Track focused work in real time.</p>
      </div>

      <Card className="flex flex-col items-center gap-6 py-10">
        <div className="flex size-40 items-center justify-center rounded-full border border-border bg-surface">
          <span className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-white">
            {formatDurationClock(elapsedSeconds / 60)}
          </span>
        </div>

        {activeLog ? (
          <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
            <div>
              <p className="text-[15px] font-medium text-white">{activeLog.title}</p>
              <p className="mt-0.5 text-xs text-secondary">Started {format(new Date(activeLog.start_time), 'h:mm a')}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleStop} loading={stopping}>
                <Square className="size-4" /> Stop &amp; save
              </Button>
              <Button variant="ghost" onClick={discard}>
                <Trash2 className="size-4" /> Discard
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleStart} className="flex w-full max-w-sm flex-col gap-3">
            <Input placeholder="What are you working on?" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus required />
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Button type="submit" size="lg" loading={starting}>
              <Play className="size-4" /> Start timer
            </Button>
          </form>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s sessions</CardTitle>
        </CardHeader>
        {loading ? null : completedToday.length === 0 ? (
          <EmptyState icon={<TimerIcon className="size-5" />} title="No sessions yet today" />
        ) : (
          <div className="space-y-1">
            {completedToday.map((log) => (
              <WorkLogItem key={log.id} log={log} onDelete={deleteLog} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
