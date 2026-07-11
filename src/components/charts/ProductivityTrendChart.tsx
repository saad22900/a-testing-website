import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DailyTotal } from '@/lib/analytics'
import { formatDuration } from '@/lib/utils'
import { CHART_AXIS_TEXT, CHART_GRID } from '@/lib/chartColors'

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const minutes = payload[0].value as number
  return (
    <div className="glass rounded-lg px-3 py-2 text-[12px] shadow-xl">
      <p className="font-medium text-white">{label}</p>
      <p className="text-secondary">{formatDuration(minutes)} logged</p>
    </div>
  )
}

export function ProductivityTrendChart({ data }: { data: DailyTotal[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={CHART_GRID} strokeDasharray="0" />
        <XAxis
          dataKey="label"
          tick={{ fill: CHART_AXIS_TEXT, fontSize: 11 }}
          axisLine={{ stroke: CHART_GRID }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: CHART_AXIS_TEXT, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => (v === 0 ? '0' : `${Math.round(v / 60)}h`)}
          width={36}
        />
        <Tooltip content={<TrendTooltip />} cursor={{ stroke: CHART_GRID, strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="minutes"
          stroke="#3B82F6"
          strokeWidth={2}
          fill="url(#trendFill)"
          dot={false}
          activeDot={{ r: 4, fill: '#3B82F6', stroke: '#09090B', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
