import { motion } from 'framer-motion'
import type { CategoryBreakdownItem } from '@/lib/analytics'
import { formatDuration } from '@/lib/utils'
import { EmptyState } from '@/components/common/EmptyState'
import { PieChart } from 'lucide-react'

export function CategoryBreakdownChart({ data }: { data: CategoryBreakdownItem[] }) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={<PieChart className="size-5" />}
        title="No work logged yet"
        description="Add work entries to see your time breakdown by category."
      />
    )
  }

  const top = data.slice(0, 8)

  return (
    <div className="space-y-3.5">
      {top.map((item, i) => (
        <div key={item.categoryId}>
          <div className="mb-1.5 flex items-center justify-between text-[13px]">
            <span className="flex items-center gap-2 font-medium text-white">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="text-secondary">
              {formatDuration(item.minutes)} · {item.percent.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.percent}%` }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full"
              style={{ backgroundColor: item.color }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
