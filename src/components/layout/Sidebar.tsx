import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronsLeft, Plus } from 'lucide-react'
import { Logo, LogoMark } from '@/components/common/Logo'
import { navGroups } from '@/lib/nav'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const setQuickAddOpen = useUIStore((s) => s.setQuickAddOpen)

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 248 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-20 hidden h-svh shrink-0 flex-col border-r border-border bg-surface px-3 py-4 md:flex"
    >
      <div className="mb-6 flex items-center justify-between px-1">
        {collapsed ? <LogoMark className="h-8 w-8" /> : <Logo />}
      </div>

      <button
        onClick={() => setQuickAddOpen(true)}
        className={cn(
          'mb-5 flex h-10 items-center justify-center gap-2 rounded-lg bg-accent text-sm font-medium text-white transition-colors hover:bg-accent-hover accent-glow',
          collapsed ? 'w-10 self-center px-0' : 'w-full px-3',
        )}
      >
        <Plus className="size-4 shrink-0" />
        {!collapsed && 'Quick Add'}
      </button>

      <nav className="flex-1 space-y-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex h-9.5 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium transition-colors',
                      isActive
                        ? 'bg-accent-soft text-accent-light'
                        : 'text-secondary hover:bg-white/5 hover:text-white',
                      collapsed && 'justify-center px-0',
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="size-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <button
        onClick={toggleSidebar}
        className="mt-2 flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-secondary transition-colors hover:bg-white/5 hover:text-white"
      >
        <ChevronsLeft className={cn('size-4 shrink-0 transition-transform', collapsed && 'rotate-180')} />
        {!collapsed && 'Collapse'}
      </button>
    </motion.aside>
  )
}
