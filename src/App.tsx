import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Splash } from '@/pages/Splash'
import { Login } from '@/pages/Login'
import { AppLayout } from '@/components/layout/AppLayout'
import { RequireAuth } from '@/components/layout/RequireAuth'
import { LogoMark } from '@/components/common/Logo'
import { useAuthStore } from '@/store/authStore'

const Dashboard = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const DailyTimeline = lazy(() => import('@/pages/DailyTimeline').then((m) => ({ default: m.DailyTimeline })))
const TaskTimerPage = lazy(() => import('@/pages/TaskTimerPage').then((m) => ({ default: m.TaskTimerPage })))
const CalendarPage = lazy(() => import('@/pages/Calendar').then((m) => ({ default: m.CalendarPage })))
const WeeklyAnalytics = lazy(() => import('@/pages/WeeklyAnalytics').then((m) => ({ default: m.WeeklyAnalytics })))
const MonthlyAnalytics = lazy(() => import('@/pages/MonthlyAnalytics').then((m) => ({ default: m.MonthlyAnalytics })))
const AIInsights = lazy(() => import('@/pages/AIInsights').then((m) => ({ default: m.AIInsights })))
const Reports = lazy(() => import('@/pages/Reports').then((m) => ({ default: m.Reports })))
const SearchPage = lazy(() => import('@/pages/Search').then((m) => ({ default: m.SearchPage })))
const NotificationsPage = lazy(() => import('@/pages/Notifications').then((m) => ({ default: m.NotificationsPage })))
const Profile = lazy(() => import('@/pages/Profile').then((m) => ({ default: m.Profile })))
const Settings = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.Settings })))

function RouteFallback() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <LogoMark className="h-9 w-9 animate-pulse-glow" />
    </div>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <>
      <AnimatePresence>{showSplash && <Splash onComplete={() => setShowSplash(false)} />}</AnimatePresence>

      {!showSplash && (
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                element={
                  <RequireAuth>
                    <AppLayout />
                  </RequireAuth>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/timeline" element={<DailyTimeline />} />
                <Route path="/timer" element={<TaskTimerPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/analytics/weekly" element={<WeeklyAnalytics />} />
                <Route path="/analytics/monthly" element={<MonthlyAnalytics />} />
                <Route path="/insights" element={<AIInsights />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      )}
    </>
  )
}
