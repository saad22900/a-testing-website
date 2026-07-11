import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { WorkLogWithCategory } from '@/lib/database.types'

export function useTaskTimer() {
  const userId = useAuthStore((s) => s.user?.id)
  const [activeLog, setActiveLog] = useState<WorkLogWithCategory | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const tickRef = useRef<number | null>(null)

  const fetchActive = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('work_logs')
      .select('*, category:work_categories(*)')
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle()
    setActiveLog((data as unknown as WorkLogWithCategory) ?? null)
  }, [userId])

  useEffect(() => {
    fetchActive()
  }, [fetchActive])

  useEffect(() => {
    if (tickRef.current) window.clearInterval(tickRef.current)
    if (activeLog) {
      const tick = () => {
        const started = new Date(activeLog.start_time).getTime()
        setElapsedSeconds(Math.max(0, Math.floor((Date.now() - started) / 1000)))
      }
      tick()
      tickRef.current = window.setInterval(tick, 1000)
    } else {
      setElapsedSeconds(0)
    }
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current)
    }
  }, [activeLog])

  const start = useCallback(
    async (title: string, categoryId: string | null) => {
      if (!userId) return { error: 'Not authenticated' }
      const now = new Date()
      const { data, error } = await supabase
        .from('work_logs')
        .insert({
          user_id: userId,
          title,
          category_id: categoryId,
          status: 'in_progress',
          start_time: now.toISOString(),
          work_date: now.toISOString().slice(0, 10),
        })
        .select('*, category:work_categories(*)')
        .single()
      if (!error && data) setActiveLog(data as unknown as WorkLogWithCategory)
      return { error: error?.message ?? null }
    },
    [userId],
  )

  const stop = useCallback(async () => {
    if (!activeLog) return { error: null }
    const end = new Date()
    const durationMinutes = Math.max(
      1,
      Math.round((end.getTime() - new Date(activeLog.start_time).getTime()) / 60000),
    )
    const { error } = await supabase
      .from('work_logs')
      .update({
        status: 'completed',
        end_time: end.toISOString(),
        duration_minutes: durationMinutes,
      })
      .eq('id', activeLog.id)
    if (!error) setActiveLog(null)
    return { error: error?.message ?? null }
  }, [activeLog])

  const discard = useCallback(async () => {
    if (!activeLog) return
    await supabase.from('work_logs').delete().eq('id', activeLog.id)
    setActiveLog(null)
  }, [activeLog])

  return { activeLog, elapsedSeconds, start, stop, discard, refetch: fetchActive }
}
