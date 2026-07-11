import { useState } from 'react'
import { LogOut, Save, Sidebar as SidebarIcon } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'

const timezones = [
  'UTC',
  'Asia/Karachi',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
]

export function Settings() {
  const profile = useAuthStore((s) => s.profile)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const signOut = useAuthStore((s) => s.signOut)
  const pushToast = useUIStore((s) => s.pushToast)
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  const [dailyGoal, setDailyGoal] = useState(String(profile?.daily_goal_minutes ?? 480))
  const [timezone, setTimezone] = useState(profile?.timezone ?? 'UTC')
  const [saving, setSaving] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await updateProfile({
      daily_goal_minutes: Math.max(60, Number(dailyGoal) || 480),
      timezone,
    })
    setSaving(false)
    if (error) pushToast({ title: 'Could not save settings', description: error, variant: 'error' })
    else pushToast({ title: 'Settings saved', variant: 'success' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Settings</h1>
        <p className="mt-1 text-[13px] text-secondary">Configure your workspace preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Work preferences</CardTitle>
        </CardHeader>
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Daily goal (minutes)"
            type="number"
            min={60}
            step={30}
            value={dailyGoal}
            onChange={(e) => setDailyGoal(e.target.value)}
          />
          <Select label="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </Select>
          <div className="sm:col-span-2">
            <Button type="submit" loading={saving}>
              <Save className="size-4" /> Save preferences
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interface</CardTitle>
        </CardHeader>
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <SidebarIcon className="size-4 text-secondary" />
            <div>
              <p className="text-[13.5px] font-medium text-white">Collapsed sidebar</p>
              <p className="text-xs text-secondary">Show icon-only navigation to maximize workspace.</p>
            </div>
          </div>
          <Toggle checked={sidebarCollapsed} onChange={toggleSidebar} />
        </div>
      </Card>

      <Card className="border-danger/20">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
          <div>
            <p className="text-[13.5px] font-medium text-white">Sign out</p>
            <p className="text-xs text-secondary">End your session on this device.</p>
          </div>
          <Button variant="danger" size="sm" onClick={signOut}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </Card>
    </div>
  )
}
