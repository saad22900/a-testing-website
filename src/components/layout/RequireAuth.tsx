import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LogoMark } from '@/components/common/Logo'

export function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)

  if (status !== 'ready') {
    return (
      <div className="flex h-svh items-center justify-center bg-background">
        <LogoMark className="h-10 w-10 animate-pulse-glow" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}
