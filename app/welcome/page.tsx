'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PawPrint } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('.supabase.co') ?? false

export default function WelcomePage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => { document.title = 'Welcome — PawCalm' }, [])

  // Returning users who already completed onboarding skip to home
  useEffect(() => {
    if (isConfigured && user?.user_metadata?.onboarding_complete) {
      router.replace('/')
    }
  }, [user, router])

  const name = user?.user_metadata?.full_name
    ?? (user?.email ? user.email.split('@')[0] : null)

  return (
    <div className="min-h-screen bg-soft-cream flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[400px] flex flex-col items-center gap-8 text-center">

        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-light-teal flex items-center justify-center">
          <PawPrint className="w-12 h-12 text-pawcalm-teal" />
        </div>

        {/* Copy */}
        <div className="flex flex-col gap-3">
          <h1 className="text-[28px] font-bold text-calm-navy leading-tight">
            Welcome to PawCalm{name ? `, ${name}` : ''}!
          </h1>
          <p className="text-[15px] text-medium-gray leading-relaxed">
            Let&apos;s set up your first pet&apos;s profile so we can start helping when it matters most.
          </p>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-3">
          <button
            type="button"
            onClick={() => router.push('/onboarding')}
            className="w-full bg-pawcalm-teal text-white font-bold text-[15px] rounded-button min-h-[48px]"
          >
            Get started
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-sm text-medium-gray py-2"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
