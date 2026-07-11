import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MobileNav } from './MobileNav'
import { PageTransition } from './PageTransition'
import { ToastContainer } from './ToastContainer'
import { QuickAddModal } from '@/components/work/QuickAddModal'

export function AppLayout() {
  const location = useLocation()

  return (
    <div className="flex h-svh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-4 pb-20 pt-6 sm:px-6 md:pb-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <Outlet />
              </PageTransition>
            </AnimatePresence>
          </div>
        </main>
      </div>
      <MobileNav />
      <QuickAddModal />
      <ToastContainer />
    </div>
  )
}
