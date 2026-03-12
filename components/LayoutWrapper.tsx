'use client'

import { usePathname } from 'next/navigation'
import BottomNav from '@/components/navigation/BottomNav'

const PATHS_WITHOUT_NAV = ['/onboarding', '/concern', '/processing', '/results', '/assessment']

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showNav = !PATHS_WITHOUT_NAV.some((p) => pathname.startsWith(p))

  return (
    <div className="relative min-h-screen max-w-md mx-auto">
      <main className={showNav ? 'pb-16' : 'pb-0'}>{children}</main>
      {showNav && <BottomNav />}
    </div>
  )
}
