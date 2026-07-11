import { differenceInCalendarDays, format, parseISO, subDays } from 'date-fns'
import type { WorkLogWithCategory } from './database.types'
import { averageDuration, categoryBreakdown, longestTask, weeklyComparison } from './analytics'

export type InsightTone = 'positive' | 'neutral' | 'warning'

export interface Insight {
  id: string
  tone: InsightTone
  title: string
  message: string
}

export function generateInsights(logs: WorkLogWithCategory[], dailyGoalMinutes = 480): Insight[] {
  const insights: Insight[] = []
  if (logs.length === 0) {
    return [
      {
        id: 'no-data',
        tone: 'neutral',
        title: 'Start logging to unlock insights',
        message: 'Once you log a few days of work, AI Insights will surface patterns, trends, and recommendations automatically.',
      },
    ]
  }

  const completed = logs.filter((l) => l.status === 'completed')

  // Most productive weekday
  const byWeekday = new Map<number, number>()
  for (const log of completed) {
    const day = parseISO(log.work_date).getDay()
    byWeekday.set(day, (byWeekday.get(day) ?? 0) + log.duration_minutes)
  }
  if (byWeekday.size > 0) {
    const [bestDay] = Array.from(byWeekday.entries()).sort((a, b) => b[1] - a[1])[0]
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][bestDay]
    insights.push({
      id: 'best-day',
      tone: 'positive',
      title: `${dayName}s are your most productive`,
      message: `You consistently log more work on ${dayName}s than any other day. Consider scheduling high-focus tasks then.`,
    })
  }

  // Category concentration
  const breakdown = categoryBreakdown(completed)
  if (breakdown.length > 0) {
    const top = breakdown[0]
    if (top.percent > 45) {
      insights.push({
        id: 'category-concentration',
        tone: 'neutral',
        title: `${top.name} dominates your time`,
        message: `${top.percent.toFixed(0)}% of logged work falls under ${top.name}. If this is unexpected, review your workload balance across categories.`,
      })
    }
  }

  // Weekly trend
  const wc = weeklyComparison(logs)
  if (wc.previousMinutes > 0) {
    if (wc.deltaPercent >= 15) {
      insights.push({
        id: 'trend-up',
        tone: 'positive',
        title: 'Productivity trending up',
        message: `Logged time is up ${Math.round(wc.deltaPercent)}% compared to last week — great momentum, keep it going.`,
      })
    } else if (wc.deltaPercent <= -15) {
      insights.push({
        id: 'trend-down',
        tone: 'warning',
        title: 'Productivity dipped this week',
        message: `Logged time is down ${Math.round(Math.abs(wc.deltaPercent))}% compared to last week. Worth checking in on blockers or workload shifts.`,
      })
    }
  }

  // Longest task
  const longest = longestTask(completed)
  if (longest && longest.duration_minutes >= 150) {
    insights.push({
      id: 'longest-task',
      tone: 'neutral',
      title: 'A task ran unusually long',
      message: `"${longest.title}" took ${(longest.duration_minutes / 60).toFixed(1)}h. Consider breaking similar tasks into smaller, trackable chunks.`,
    })
  }

  // Average duration guidance
  const avg = averageDuration(completed)
  if (avg > 0 && avg < 20) {
    insights.push({
      id: 'short-tasks',
      tone: 'neutral',
      title: 'Lots of short tasks',
      message: `Your average task is only ${Math.round(avg)} minutes. Batching similar small tasks together can reduce context-switching overhead.`,
    })
  }

  // Consistency streak
  const uniqueDates = Array.from(new Set(completed.map((l) => l.work_date))).sort().reverse()
  let streak = 0
  let cursor = new Date()
  for (const dateStr of uniqueDates) {
    const diff = differenceInCalendarDays(cursor, parseISO(dateStr))
    if (diff <= 1) {
      streak += 1
      cursor = parseISO(dateStr)
    } else break
  }
  if (streak >= 3) {
    insights.push({
      id: 'streak',
      tone: 'positive',
      title: `${streak}-day logging streak`,
      message: `You've logged work ${streak} days in a row. Consistent tracking gives you far more reliable analytics.`,
    })
  }

  // Overwork detection
  const last7 = completed.filter((l) => parseISO(l.work_date) >= subDays(new Date(), 6))
  const perDay = new Map<string, number>()
  for (const l of last7) perDay.set(l.work_date, (perDay.get(l.work_date) ?? 0) + l.duration_minutes)
  const overloadedDays = Array.from(perDay.values()).filter((m) => m > dailyGoalMinutes * 1.25).length
  if (overloadedDays >= 2) {
    insights.push({
      id: 'overload',
      tone: 'warning',
      title: 'Signs of overload this week',
      message: `${overloadedDays} day(s) exceeded 125% of your daily goal (${format(new Date(), 'MMM d')}). Keep an eye on burnout risk.`,
    })
  }

  return insights.slice(0, 6)
}
