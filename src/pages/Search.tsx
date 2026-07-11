import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { format, subDays } from 'date-fns'
import { Search as SearchIcon } from 'lucide-react'
import { useWorkLogs } from '@/hooks/useWorkLogs'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { WorkLogItem } from '@/components/work/WorkLogItem'
import { EmptyState } from '@/components/common/EmptyState'

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')

  const range = useMemo(
    () => ({ from: format(subDays(new Date(), 179), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') }),
    [],
  )
  const { logs, loading, deleteLog } = useWorkLogs(range)

  const q = query.trim().toLowerCase()
  const results = q
    ? logs.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          (l.category?.name.toLowerCase().includes(q) ?? false),
      )
    : logs.slice(0, 20)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Search</h1>
        <p className="mt-1 text-[13px] text-secondary">Find work logs by title, notes, or category.</p>
      </div>

      <Input
        icon={<SearchIcon className="size-4" />}
        placeholder="Search work logs…"
        value={query}
        autoFocus
        onChange={(e) => {
          setQuery(e.target.value)
          setParams(e.target.value ? { q: e.target.value } : {})
        }}
        className="h-11"
      />

      {!q && <p className="text-xs text-muted">Showing your {results.length} most recent entries.</p>}
      {q && <p className="text-xs text-muted">{results.length} result{results.length === 1 ? '' : 's'} for “{query}”</p>}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState icon={<SearchIcon className="size-5" />} title="No matching work logs" description="Try a different search term." />
      ) : (
        <div className="space-y-1">
          {results.map((log) => (
            <WorkLogItem key={log.id} log={log} onDelete={deleteLog} showDate />
          ))}
        </div>
      )}
    </div>
  )
}
