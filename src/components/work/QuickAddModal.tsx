import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useCategories } from '@/hooks/useCategories'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { supabase } from '@/lib/supabase'

export function QuickAddModal() {
  const open = useUIStore((s) => s.quickAddOpen)
  const setOpen = useUIStore((s) => s.setQuickAddOpen)
  const pushToast = useUIStore((s) => s.pushToast)
  const userId = useAuthStore((s) => s.user?.id)
  const { categories } = useCategories()

  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('30')
  const [priority, setPriority] = useState('medium')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)

  function reset() {
    setTitle('')
    setCategoryId('')
    setDescription('')
    setDuration('30')
    setPriority('medium')
    setDate(new Date().toISOString().slice(0, 10))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !title.trim()) return
    setSaving(true)
    const minutes = Math.max(1, Number(duration) || 0)
    const start = new Date()
    const { error } = await supabase.from('work_logs').insert({
      user_id: userId,
      title: title.trim(),
      description: description.trim(),
      category_id: categoryId || null,
      status: 'completed',
      work_date: date,
      start_time: start.toISOString(),
      end_time: start.toISOString(),
      duration_minutes: minutes,
      priority,
    })
    setSaving(false)
    if (error) {
      pushToast({ title: 'Could not save work log', description: error.message, variant: 'error' })
      return
    }
    pushToast({ title: 'Work log added', description: title.trim(), variant: 'success' })
    reset()
    setOpen(false)
    window.dispatchEvent(new CustomEvent('work-log-created'))
  }

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Quick Add Work">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="What did you work on?"
          placeholder="e.g. Screened 12 candidates for Analyst role"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Duration (minutes)"
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <Textarea
          label="Notes (optional)"
          placeholder="Add extra context…"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save entry
          </Button>
        </div>
      </form>
    </Modal>
  )
}
