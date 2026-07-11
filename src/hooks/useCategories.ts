import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { WorkCategory } from '@/lib/database.types'

export function useCategories() {
  const [categories, setCategories] = useState<WorkCategory[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('work_categories')
      .select('*')
      .order('is_default', { ascending: false })
      .order('name', { ascending: true })
    if (!error && data) setCategories(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return { categories, loading, refetch: fetchCategories }
}
