import {
  LayoutDashboard,
  ListTree,
  Timer,
  CalendarDays,
  BarChart3,
  TrendingUp,
  Sparkles,
  FileBarChart,
  Search,
  Bell,
  User,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      { label: 'Daily Timeline', path: '/timeline', icon: ListTree },
      { label: 'Task Timer', path: '/timer', icon: Timer },
      { label: 'Calendar', path: '/calendar', icon: CalendarDays },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { label: 'Weekly Analytics', path: '/analytics/weekly', icon: BarChart3 },
      { label: 'Monthly Analytics', path: '/analytics/monthly', icon: TrendingUp },
      { label: 'AI Insights', path: '/insights', icon: Sparkles },
      { label: 'Reports', path: '/reports', icon: FileBarChart },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { label: 'Search', path: '/search', icon: Search },
      { label: 'Notifications', path: '/notifications', icon: Bell },
      { label: 'Profile', path: '/profile', icon: User },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
]
