import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ListTree, Timer, BarChart3, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { label: 'Home', path: '/', icon: LayoutDashboard },
  { label: 'Timeline', path: '/timeline', icon: ListTree },
  { label: 'Timer', path: '/timer', icon: Timer },
  { label: 'Weekly', path: '/analytics/weekly', icon: BarChart3 },
  { label: 'Insights', path: '/insights', icon: Sparkles },
]

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-border bg-surface/95 px-2 py-2 backdrop-blur-xl md:hidden">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors',
              isActive ? 'text-accent-light' : 'text-muted',
            )
          }
        >
          <item.icon className="size-5" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
