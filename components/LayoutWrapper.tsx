'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { PawPrint } from 'lucide-react'
import BottomNav from '@/components/navigation/BottomNav'
import { useAuth } from '@/contexts/AuthContext'

const PATHS_WITHOUT_NAV = [
  '/onboarding', '/concern', '/processing', '/results', '/assessment',
  '/login', '/signup', '/forgot-password', '/welcome'
]

const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('.supabase.co') ?? false

function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-soft-cream flex flex-col items-center justify-center gap-3 z-50">
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <PawPrint className="w-16 h-16 text-pawcalm-teal" />
      </motion.div>
      <p className="text-xl font-bold text-calm-navy">PawCalm</p>
    </div>
  )
}

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isLoading } = useAuth()
  const showNav = !PATHS_WITHOUT_NAV.some((p) => pathname.startsWith(p))

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  if (isConfigured && isLoading) {
    return <SplashScreen />
  }

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
