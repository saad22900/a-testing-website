import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-3 py-16 text-center"
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-white/5 text-secondary">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-white">{title}</p>
        {description && <p className="max-w-xs text-[13px] text-secondary">{description}</p>}
      </div>
      {action}
    </motion.div>
  )
}
