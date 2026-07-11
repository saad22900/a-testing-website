import { formatDistanceToNow } from 'date-fns'
import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { cn } from '@/lib/utils'
import type { NotificationType } from '@/lib/database.types'

const typeMeta: Record<NotificationType, { icon: typeof Info; color: string }> = {
  info: { icon: Info, color: 'text-accent-light bg-accent-soft' },
  success: { icon: CheckCircle2, color: 'text-success bg-success/10' },
  warning: { icon: AlertTriangle, color: 'text-warning bg-warning/10' },
  insight: { icon: Sparkles, color: 'text-accent-light bg-accent-soft' },
}

export function NotificationsPage() {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Notifications</h1>
          <p className="mt-1 text-[13px] text-secondary">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="size-4" /> Mark all as read
          </Button>
        )}
      </div>

      <Card>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState icon={<Bell className="size-5" />} title="No notifications yet" description="We'll let you know when something needs your attention." />
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => {
              const meta = typeMeta[n.type]
              const Icon = meta.icon
              return (
                <button
                  key={n.id}
                  onClick={() => !n.read && markAsRead(n.id)}
                  className={cn(
                    'flex w-full items-start gap-3 py-3.5 text-left transition-colors first:pt-0 last:pb-0 hover:bg-white/[0.02]',
                  )}
                >
                  <div className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg', meta.color)}>
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-[13.5px] font-medium', n.read ? 'text-secondary' : 'text-white')}>{n.title}</p>
                    {n.message && <p className="mt-0.5 text-xs leading-relaxed text-secondary">{n.message}</p>}
                    <p className="mt-1 text-[11px] text-muted">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                  </div>
                  {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />}
                </button>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
