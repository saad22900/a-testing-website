import type { HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  delay?: number
}

export function Card({ className, hover = false, delay = 0, children, ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hover ? { y: -3, borderColor: '#3f3f46' } : undefined}
      className={cn(
        'rounded-2xl border border-border bg-card p-5',
        hover && 'cursor-pointer transition-shadow hover:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.6)]',
        className,
      )}
      {...(props as any)}
    >
      {children}
    </motion.div>
  )
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-[15px] font-semibold text-white', className)} {...props}>
      {children}
    </h3>
  )
}
