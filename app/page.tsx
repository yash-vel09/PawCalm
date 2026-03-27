'use client'

import { Bell } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store'
import { useAuth } from '@/contexts/AuthContext'
import DogProfileCard from '@/components/home/DogProfileCard'
import LogConcernButton from '@/components/home/LogConcernButton'
import RecentAssessments from '@/components/home/RecentAssessments'
import WeeklyWellnessCard from '@/components/home/WeeklyWellnessCard'
import FollowUpBanner from '@/components/home/FollowUpBanner'
import PetSwitcher from '@/components/home/PetSwitcher'

const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('.supabase.co') ?? false

export default function HomePage() {
  const getActivePet = useAppStore((s) => s.getActivePet)
  const activePetId = useAppStore((s) => s.activePetId)
  const assessmentHistory = useAppStore((s) => s.assessmentHistory)
  const { user } = useAuth()

  const activePet = getActivePet()
  const petName = activePet?.name ?? 'your pup'
  const petHistory = assessmentHistory
    .filter((e) => e.petId === activePetId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  const lastAssessment = petHistory[0] ?? null

  const ownerName = user?.user_metadata?.full_name
    ?? (user?.email ? user.email.split('@')[0] : null)

  return (
    <div className="min-h-screen bg-soft-cream">
      <div className="px-4 pt-12 pb-8 space-y-5">

        {/* Top bar */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-calm-navy">
              {ownerName ? `Hi, ${ownerName} 👋` : 'Hi there 👋'}
            </h1>
            <p className="text-sm text-medium-gray mt-0.5">
              {activePet ? `${petName}'s dashboard` : 'Welcome to PawCalm'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isConfigured && (
              <span className="text-[11px] font-semibold text-pawcalm-teal bg-light-teal px-2 py-0.5 rounded-full">
                Demo
              </span>
            )}
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-warm-gray shadow-sm"
              aria-label="Notifications"
            >
              <Bell size={20} strokeWidth={1.5} className="text-medium-gray" />
            </button>
          </div>
        </div>

        {/* Pet switcher */}
        <PetSwitcher />

        {/* Animated content keyed to active pet */}
        <motion.div
          key={activePetId ?? 'none'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="space-y-5">
            {/* Pet profile card */}
            <DogProfileCard profile={activePet} lastAssessment={lastAssessment} />

            {/* Weekly wellness overview */}
            <WeeklyWellnessCard petType={activePet?.type ?? 'dog'} />

            {/* Primary CTA */}
            <LogConcernButton />

            {/* Follow-up resolution banner */}
            <FollowUpBanner />

            {/* Recent assessments */}
            <RecentAssessments assessments={petHistory.slice(0, 3)} dogName={petName} />
          </div>
        </motion.div>

      </div>
    </div>
  )
}
