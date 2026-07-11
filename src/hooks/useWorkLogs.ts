import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { WorkLog, WorkLogWithCategory } from '@/lib/database.types'

interface DateRange {
  from: string
  to: string
}

export function useWorkLogs(range?: DateRange) {
  const userId = useAuthStore((s) => s.user?.id)
  const [logs, setLogs] = useState<WorkLogWithCategory[]>([])
  const [loading, setLoading] = useState(true)

  // Depends on primitives (range?.from/to), not `range` itself, since some callers pass an
  // inline object literal that would otherwise recreate this callback (and re-fetch) every render.
  const fetchLogs = useCallback(async () => {
    if (!userId) {
      setLogs([])
      setLoading(false)
      return
    }
    setLoading(true)
    let query = supabase
      .from('work_logs')
      .select('*, category:work_categories(*)')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })

    if (range) {
      query = query.gte('work_date', range.from).lte('work_date', range.to)
    }

    const { data, error } = await query
    if (!error && data) setLogs(data as unknown as WorkLogWithCategory[])
    setLoading(false)
  }, [userId, range?.from, range?.to])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  useEffect(() => {
    const handler = () => fetchLogs()
    window.addEventListener('work-log-created', handler)
    return () => window.removeEventListener('work-log-created', handler)
  }, [fetchLogs])

  const createLog = useCallback(
    async (input: Partial<WorkLog> & { title: string }) => {
      if (!userId) return { error: 'Not authenticated' }
      const { error } = await supabase.from('work_logs').insert({ ...input, user_id: userId })
      if (!error) await fetchLogs()
      return { error: error?.message ?? null }
    },
    [userId, fetchLogs],
  )

  const updateLog = useCallback(
    async (id: string, updates: Partial<WorkLog>) => {
      const { error } = await supabase.from('work_logs').update(updates).eq('id', id)
      if (!error) await fetchLogs()
      return { error: error?.message ?? null }
    },
    [fetchLogs],
  )

  const deleteLog = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('work_logs').delete().eq('id', id)
      if (!error) await fetchLogs()
      return { error: error?.message ?? null }
    },
    [fetchLogs],
  )

  return { logs, loading, refetch: fetchLogs, createLog, updateLog, deleteLog }
}
