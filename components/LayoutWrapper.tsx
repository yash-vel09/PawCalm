'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import BottomNav from '@/components/navigation/BottomNav'

const PATHS_WITHOUT_NAV = ['/onboarding', '/concern', '/processing', '/results', '/assessment']

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showNav = !PATHS_WITHOUT_NAV.some((p) => pathname.startsWith(p))

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <div className="relative min-h-screen max-w-md mx-auto">
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className={showNav ? 'pb-16' : 'pb-0'}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      {showNav && <BottomNav />}
    </div>
  )
}
