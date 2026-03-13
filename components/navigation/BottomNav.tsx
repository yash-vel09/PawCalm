'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Clock, PawPrint, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Tab {
  label: string
  icon: LucideIcon
  path: string
}

const tabs: Tab[] = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'History', icon: Clock, path: '/history' },
  { label: 'Profile', icon: PawPrint, path: '/profile' },
  { label: 'Settings', icon: Settings, path: '/settings' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Main navigation" className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-16 bg-white border-t border-warm-gray z-50">
      <div className="flex items-center justify-around h-full px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path
          const Icon = tab.icon
          return (
            <Link
              key={tab.path}
              href={tab.path}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-col items-center gap-0.5 py-2 px-3 min-w-[48px] min-h-[48px] justify-center"
            >
              <Icon
                size={24}
                strokeWidth={1.5}
                className={isActive ? 'text-pawcalm-teal' : 'text-medium-gray'}
              />
              <span
                className={`text-[11px] font-medium ${
                  isActive ? 'text-pawcalm-teal' : 'text-medium-gray'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
