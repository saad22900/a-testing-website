export type WorkLogStatus = 'completed' | 'in_progress'
export type WorkLogPriority = 'low' | 'medium' | 'high'
export type NotificationType = 'info' | 'success' | 'warning' | 'insight'

export interface Profile {
  id: string
  full_name: string
  email: string
  job_title: string
  department: string
  avatar_url: string | null
  timezone: string
  daily_goal_minutes: number
  created_at: string
  updated_at: string
}

export interface WorkCategory {
  id: string
  user_id: string | null
  name: string
  color: string
  icon: string
  is_default: boolean
  created_at: string
}

export interface WorkLog {
  id: string
  user_id: string
  category_id: string | null
  title: string
  description: string
  status: WorkLogStatus
  work_date: string
  start_time: string
  end_time: string | null
  duration_minutes: number
  priority: WorkLogPriority
  created_at: string
  updated_at: string
}

export interface WorkLogWithCategory extends WorkLog {
  category: WorkCategory | null
}

export interface AppNotification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  created_at: string
}

