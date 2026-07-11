import type { WorkLogWithCategory } from './database.types'

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export function workLogsToCsv(logs: WorkLogWithCategory[]): string {
  const header = ['Date', 'Title', 'Category', 'Status', 'Priority', 'Duration (min)', 'Notes']
  const rows = logs.map((l) => [
    l.work_date,
    l.title,
    l.category?.name ?? 'Uncategorized',
    l.status,
    l.priority,
    String(l.duration_minutes),
    l.description ?? '',
  ])
  return [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n')
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
