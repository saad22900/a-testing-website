import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns'
import type { WorkLogWithCategory } from './database.types'

export interface CategoryBreakdownItem {
  categoryId: string
  name: string
  color: string
  minutes: number
  count: number
  percent: number
}

export function categoryBreakdown(logs: WorkLogWithCategory[]): CategoryBreakdownItem[] {
  const totals = new Map<string, { name: string; color: string; minutes: number; count: number }>()
  let grandTotal = 0

  for (const log of logs) {
    const key = log.category_id ?? 'uncategorized'
    const name = log.category?.name ?? 'Uncategorized'
    const color = log.category?.color ?? '#71717A'
    const current = totals.get(key) ?? { name, color, minutes: 0, count: 0 }
    current.minutes += log.duration_minutes
    current.count += 1
    totals.set(key, current)
    grandTotal += log.duration_minutes
  }

  return Array.from(totals.entries())
    .map(([categoryId, v]) => ({
      categoryId,
      name: v.name,
      color: v.color,
      minutes: v.minutes,
      count: v.count,
      percent: grandTotal > 0 ? (v.minutes / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.minutes - a.minutes)
}

export interface DailyTotal {
  date: string
  label: string
  minutes: number
  count: number
}

export function dailyTotals(logs: WorkLogWithCategory[], from: Date, to: Date): DailyTotal[] {
  const days = eachDayOfInterval({ start: from, end: to })
  const map = new Map<string, { minutes: number; count: number }>()
  for (const log of logs) {
    const key = log.work_date
    const current = map.get(key) ?? { minutes: 0, count: 0 }
    current.minutes += log.duration_minutes
    current.count += 1
    map.set(key, current)
  }
  return days.map((day) => {
    const key = format(day, 'yyyy-MM-dd')
    const v = map.get(key) ?? { minutes: 0, count: 0 }
    return { date: key, label: format(day, 'EEE'), minutes: v.minutes, count: v.count }
  })
}

export function totalMinutes(logs: WorkLogWithCategory[]): number {
  return logs.reduce((sum, l) => sum + l.duration_minutes, 0)
}

export function averageDuration(logs: WorkLogWithCategory[]): number {
  const completed = logs.filter((l) => l.status === 'completed')
  if (completed.length === 0) return 0
  return totalMinutes(completed) / completed.length
}

export function longestTask(logs: WorkLogWithCategory[]): WorkLogWithCategory | null {
  if (logs.length === 0) return null
  return logs.reduce((max, l) => (l.duration_minutes > (max?.duration_minutes ?? 0) ? l : max), logs[0])
}

export function mostCommonTask(logs: WorkLogWithCategory[]): { title: string; count: number } | null {
  if (logs.length === 0) return null
  const counts = new Map<string, number>()
  for (const log of logs) {
    const key = log.title.trim().toLowerCase()
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  let best: [string, number] | null = null
  for (const entry of counts.entries()) {
    if (!best || entry[1] > best[1]) best = entry
  }
  if (!best) return null
  const original = logs.find((l) => l.title.trim().toLowerCase() === best![0])
  return { title: original?.title ?? best[0], count: best[1] }
}

export interface PeriodComparison {
  currentMinutes: number
  previousMinutes: number
  currentCount: number
  previousCount: number
  deltaPercent: number
}

export function weeklyComparison(logs: WorkLogWithCategory[], today = new Date()): PeriodComparison {
  const thisStart = startOfWeek(today, { weekStartsOn: 1 })
  const thisEnd = endOfWeek(today, { weekStartsOn: 1 })
  const lastStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 })
  const lastEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 })
  return periodComparison(logs, thisStart, thisEnd, lastStart, lastEnd)
}

export function monthlyComparison(logs: WorkLogWithCategory[], today = new Date()): PeriodComparison {
  const thisStart = startOfMonth(today)
  const thisEnd = endOfMonth(today)
  const lastStart = startOfMonth(subMonths(today, 1))
  const lastEnd = endOfMonth(subMonths(today, 1))
  return periodComparison(logs, thisStart, thisEnd, lastStart, lastEnd)
}

function periodComparison(
  logs: WorkLogWithCategory[],
  curStart: Date,
  curEnd: Date,
  prevStart: Date,
  prevEnd: Date,
): PeriodComparison {
  let currentMinutes = 0
  let previousMinutes = 0
  let currentCount = 0
  let previousCount = 0

  for (const log of logs) {
    const d = parseISO(log.work_date)
    if (d >= curStart && d <= curEnd) {
      currentMinutes += log.duration_minutes
      currentCount += 1
    } else if (d >= prevStart && d <= prevEnd) {
      previousMinutes += log.duration_minutes
      previousCount += 1
    }
  }

  const deltaPercent =
    previousMinutes === 0
      ? currentMinutes > 0
        ? 100
        : 0
      : ((currentMinutes - previousMinutes) / previousMinutes) * 100

  return { currentMinutes, previousMinutes, currentCount, previousCount, deltaPercent }
}

export interface HeatmapCell {
  date: string
  minutes: number
  level: 0 | 1 | 2 | 3 | 4
}

export function heatmapData(logs: WorkLogWithCategory[], weeks = 18): HeatmapCell[] {
  const today = new Date()
  const from = subDays(today, weeks * 7 - 1)
  const days = eachDayOfInterval({ start: from, end: today })
  const map = new Map<string, number>()
  for (const log of logs) {
    map.set(log.work_date, (map.get(log.work_date) ?? 0) + log.duration_minutes)
  }
  const max = Math.max(1, ...Array.from(map.values()))
  return days.map((day) => {
    const key = format(day, 'yyyy-MM-dd')
    const minutes = map.get(key) ?? 0
    const ratio = minutes / max
    let level: HeatmapCell['level'] = 0
    if (minutes > 0) level = ratio > 0.75 ? 4 : ratio > 0.5 ? 3 : ratio > 0.25 ? 2 : 1
    return { date: key, minutes, level }
  })
}
