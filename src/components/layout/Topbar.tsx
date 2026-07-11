import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, LogOut, Settings, User as UserIcon } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'
import { useNotifications } from '@/hooks/useNotifications'
import { greeting } from '@/lib/utils'

export function Topbar() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const signOut = useAuthStore((s) => s.signOut)
  const { unreadCount } = useNotifications()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate(`/search${query ? `?q=${encodeURIComponent(query)}` : ''}`)
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/80 px-5 backdrop-blur-xl">
      <div className="hidden flex-col sm:flex">
        <p className="text-[13px] font-medium text-secondary">
          {greeting()}, <span className="text-white">{profile?.full_name?.split(' ')[0] || 'there'}</span>
        </p>
      </div>

      <form onSubmit={handleSearch} className="ml-auto w-full max-w-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search work logs, tasks, categories…"
            className="h-9.5 w-full rounded-lg border border-border bg-card px-3.5 pl-9 text-[13px] text-white placeholder:text-muted outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </form>

      <button
        onClick={() => navigate('/notifications')}
        className="relative flex size-9.5 shrink-0 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-white/5 hover:text-white"
      >
        <Bell className="size-4.5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-2 items-center justify-center rounded-full bg-accent ring-2 ring-background" />
        )}
      </button>

      <Dropdown
        trigger={
          <button className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-white/5">
            <Avatar name={profile?.full_name || 'HR User'} src={profile?.avatar_url} size="sm" />
          </button>
        }
      >
        {(close) => (
          <>
            <div className="mb-1 border-b border-border px-3 pb-2 pt-1">
              <p className="truncate text-[13px] font-medium text-white">{profile?.full_name || 'HR User'}</p>
              <p className="truncate text-xs text-secondary">{profile?.email}</p>
            </div>
            <DropdownItem
              onClick={() => {
                navigate('/profile')
                close()
              }}
            >
              <UserIcon className="size-4" /> Profile
              <Badge variant="outline" className="ml-auto py-0.5">
                {profile?.job_title || 'HR'}
              </Badge>
            </DropdownItem>
            <DropdownItem
              onClick={() => {
                navigate('/settings')
                close()
              }}
            >
              <Settings className="size-4" /> Settings
            </DropdownItem>
            <DropdownItem
              danger
              onClick={() => {
                signOut()
                close()
              }}
            >
              <LogOut className="size-4" /> Sign out
            </DropdownItem>
          </>
        )}
      </Dropdown>
    </header>
  )
}
