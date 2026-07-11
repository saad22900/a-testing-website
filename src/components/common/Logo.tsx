import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  mark?: boolean
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" className="fill-card" />
      <path d="M32 12L50 46H41.5L32 27.5L22.5 46H14L32 12Z" fill="#3B82F6" />
      <path d="M32 27.5L38 46H26L32 27.5Z" fill="#60A5FA" />
    </svg>
  )
}

export function Logo({ className, mark = true }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {mark && <LogoMark className="h-8 w-8 shrink-0" />}
      <div className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-tight text-white">Alfalah Investments</span>
        <span className="text-[11px] font-medium tracking-wide text-secondary">HR Work Tracker</span>
      </div>
    </div>
  )
}
