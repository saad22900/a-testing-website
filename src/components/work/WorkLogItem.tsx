import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { Clock, Trash2, Loader2 } from 'lucide-react'
import type { WorkLogWithCategory } from '@/lib/database.types'
import { CategoryPill } from './CategoryPill'
import { Badge } from '@/components/ui/Badge'
import { formatDuration, cn } from '@/lib/utils'

const priorityVariant = {
  low: 'default',
  medium: 'accent',
  high: 'warning',
} as const

interface WorkLogItemProps {
  log: WorkLogWithCategory
  onDelete?: (id: string) => void
  deleting?: boolean
  showDate?: boolean
}

export function WorkLogItem({ log, onDelete, deleting, showDate }: WorkLogItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="group relative flex gap-4 pl-1"
    >
      <div className="flex w-16 shrink-0 flex-col items-end pt-0.5 text-right">
        <span className="text-[12px] font-medium text-secondary">{format(new Date(log.start_time), 'h:mm a')}</span>
        {showDate && <span className="text-[11px] text-muted">{format(new Date(log.work_date), 'MMM d')}</span>}
      </div>

      <div className="relative flex flex-col items-center">
        <span
          className={cn(
            'z-10 mt-1 size-2.5 rounded-full ring-4 ring-background',
            log.status === 'in_progress' ? 'animate-pulse-glow bg-accent' : 'bg-accent',
          )}
        />
        <span className="w-px flex-1 bg-border" />
      </div>

      <div className="flex-1 rounded-xl border border-border bg-card p-3.5 pb-4 transition-colors group-hover:border-border-hover">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-medium text-white">{log.title}</p>
            {log.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-secondary">{log.description}</p>
            )}
          </div>
          {onDelete && (
            <button
              onClick={() => onDelete(log.id)}
              disabled={deleting}
              className="shrink-0 rounded-md p-1.5 text-muted opacity-0 transition-opacity hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
            >
              {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
            </button>
          )}
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <CategoryPill category={log.category} />
          <Badge variant={priorityVariant[log.priority]} className="capitalize">
            {log.priority}
          </Badge>
          <Badge variant="outline">
            <Clock className="size-3" /> {formatDuration(log.duration_minutes)}
          </Badge>
          {log.status === 'in_progress' && (
            <Badge variant="accent" dot>
              In progress
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  )
}
