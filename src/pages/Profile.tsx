import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Save } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useWorkLogs } from '@/hooks/useWorkLogs'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { totalMinutes } from '@/lib/analytics'
import { formatDuration } from '@/lib/utils'

export function Profile() {
  const profile = useAuthStore((s) => s.profile)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const pushToast = useUIStore((s) => s.pushToast)
  const { logs, loading } = useWorkLogs()

  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [jobTitle, setJobTitle] = useState(profile?.job_title ?? '')
  const [department, setDepartment] = useState(profile?.department ?? '')
  const [saving, setSaving] = useState(false)

  const completed = logs.filter((l) => l.status === 'completed')
  const stats = useMemo(
    () => ({
      totalMinutes: totalMinutes(completed),
      totalTasks: completed.length,
    }),
    [completed],
  )

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await updateProfile({ full_name: fullName, job_title: jobTitle, department })
    setSaving(false)
    if (error) pushToast({ title: 'Could not update profile', description: error, variant: 'error' })
    else pushToast({ title: 'Profile updated', variant: 'success' })
  }

  if (!profile) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Profile</h1>
        <p className="mt-1 text-[13px] text-secondary">Manage your personal information.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="flex flex-col items-center gap-3 text-center">
          <Avatar name={profile.full_name || profile.email} size="lg" />
          <div>
            <p className="text-[15px] font-semibold text-white">{profile.full_name || 'Unnamed'}</p>
            <p className="text-[13px] text-secondary">{profile.email}</p>
          </div>
          <p className="text-[11px] text-muted">Member since {format(new Date(profile.created_at), 'MMMM yyyy')}</p>
          <div className="mt-2 grid w-full grid-cols-2 gap-3 border-t border-border pt-4">
            <div>
              <p className="text-lg font-semibold text-white">{loading ? <Skeleton className="h-6 w-12" /> : stats.totalTasks}</p>
              <p className="text-[11px] text-secondary">Tasks logged</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-white">
                {loading ? <Skeleton className="h-6 w-16" /> : formatDuration(stats.totalMinutes)}
              </p>
              <p className="text-[11px] text-secondary">Time tracked</p>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
          </CardHeader>
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input label="Email" value={profile.email} disabled />
            <Input label="Job title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
            <div className="sm:col-span-2">
              <Button type="submit" loading={saving}>
                <Save className="size-4" /> Save changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
