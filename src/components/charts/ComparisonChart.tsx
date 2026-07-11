import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDuration } from '@/lib/utils'
import { CHART_AXIS_TEXT, CHART_GRID } from '@/lib/chartColors'

interface ComparisonChartProps {
  currentLabel: string
  previousLabel: string
  data: { label: string; current: number; previous: number }[]
}

function ComparisonTooltip({ active, payload, label, currentLabel, previousLabel }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2 text-[12px] shadow-xl">
      <p className="mb-1 font-medium text-white">{label}</p>
      <p className="flex items-center gap-1.5 text-secondary">
        <span className="size-2 rounded-full bg-accent" /> {currentLabel}:{' '}
        {formatDuration(payload[0]?.value ?? 0)}
      </p>
      <p className="flex items-center gap-1.5 text-secondary">
        <span className="size-2 rounded-full bg-muted" /> {previousLabel}:{' '}
        {formatDuration(payload[1]?.value ?? 0)}
      </p>
    </div>
  )
}

export function ComparisonChart({ currentLabel, previousLabel, data }: ComparisonChartProps) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-[12px] text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-accent" /> {currentLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-muted" /> {previousLabel}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barGap={2}>
          <CartesianGrid vertical={false} stroke={CHART_GRID} />
          <XAxis dataKey="label" tick={{ fill: CHART_AXIS_TEXT, fontSize: 11 }} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
          <YAxis
            tick={{ fill: CHART_AXIS_TEXT, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (v === 0 ? '0' : `${Math.round(v / 60)}h`)}
            width={36}
          />
          <Tooltip
            content={<ComparisonTooltip currentLabel={currentLabel} previousLabel={previousLabel} />}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          />
          <Bar dataKey="current" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={22} />
          <Bar dataKey="previous" fill="#3F3F46" radius={[4, 4, 0, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
