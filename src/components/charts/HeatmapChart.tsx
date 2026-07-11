import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import type { HeatmapCell } from '@/lib/analytics'
import { formatDuration } from '@/lib/utils'

const levelColor: Record<HeatmapCell['level'], string> = {
  0: '#18181B',
  1: 'rgba(59,130,246,0.28)',
  2: 'rgba(59,130,246,0.5)',
  3: 'rgba(59,130,246,0.72)',
  4: '#3B82F6',
}

export function HeatmapChart({ data }: { data: HeatmapCell[] }) {
  const [hover, setHover] = useState<HeatmapCell | null>(null)

  const weeks = useMemo(() => {
    const cols: HeatmapCell[][] = []
    for (let i = 0; i < data.length; i += 7) cols.push(data.slice(i, i + 7))
    return cols
  }, [data])

  return (
    <div>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((cell) => (
              <div
                key={cell.date}
                onMouseEnter={() => setHover(cell)}
                onMouseLeave={() => setHover(null)}
                className="size-3 rounded-[3px] border border-white/[0.04] transition-transform hover:scale-125"
                style={{ backgroundColor: levelColor[cell.level] }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-secondary">
        <span>
          {hover
            ? `${format(parseISO(hover.date), 'MMM d, yyyy')} · ${formatDuration(hover.minutes)}`
            : 'Hover a day for details'}
        </span>
        <span className="flex items-center gap-1">
          Less
          {([0, 1, 2, 3, 4] as const).map((l) => (
            <span key={l} className="size-2.5 rounded-[3px]" style={{ backgroundColor: levelColor[l] }} />
          ))}
          More
        </span>
      </div>
    </div>
  )
}
