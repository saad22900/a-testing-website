import { getCategoryIcon } from '@/lib/categoryIcons'
import type { WorkCategory } from '@/lib/database.types'
import { cn } from '@/lib/utils'

export function CategoryPill({ category, className }: { category: WorkCategory | null; className?: string }) {
  const Icon = getCategoryIcon(category?.icon)
  const color = category?.color ?? '#71717A'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-transparent px-2.5 py-1 text-[11px] font-medium',
        className,
      )}
      style={{ backgroundColor: `${color}1f`, color }}
    >
      <Icon className="size-3" />
      {category?.name ?? 'Uncategorized'}
    </span>
  )
}

export function CategoryDot({ color, className }: { color: string; className?: string }) {
  return <span className={cn('inline-block size-2.5 rounded-full', className)} style={{ backgroundColor: color }} />
}
