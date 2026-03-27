'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { PawPrint, AlertCircle } from 'lucide-react'
import { useAppStore } from '@/store'
import type { AssessmentResult } from '@/store'

const MESSAGES = (dogName: string) => [
  `Analyzing ${dogName}'s patterns...`,
  `Reviewing ${dogName}'s profile...`,
  'Checking behavioral patterns...',
  'Preparing your guidance...',
]

const MIN_DISPLAY_MS = 2500

export default function ProcessingPage() {
  const router                  = useRouter()
  const dogProfile              = useAppStore((s) => s.dogProfile)
  const assessment              = useAppStore((s) => s.currentAssessment)
  const setAssessmentResult     = useAppStore((s) => s.setAssessmentResult)
  const setCurrentAssessmentId  = useAppStore((s) => s.setCurrentAssessmentId)

  const dogName  = dogProfile?.name ?? 'your dog'
  const messages = MESSAGES(dogName)

  const [msgIdx, setMsgIdx]     = useState(0)
  const [apiError, setApiError] = useState(false)

  // Cycle messages every 2 s
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % messages.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [messages.length])

  // Call /api/assess + enforce minimum display time, then navigate
  useEffect(() => {
    let cancelled = false

    async function run() {
      const minDelay = new Promise<void>((resolve) => setTimeout(resolve, MIN_DISPLAY_MS))

      let apiCall: Promise<AssessmentResult | null>

      if (assessment) {
        apiCall = fetch('/api/assess', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dog_profile: {
              species:           dogProfile?.type ?? 'dog',
              name:              dogProfile?.name ?? 'Unknown',
              breed:             dogProfile?.breed ?? 'Unknown',
              age_years:         dogProfile?.ageYears ?? null,
              is_puppy:          dogProfile?.isPuppy ?? false,
              weight_lbs:        dogProfile?.weightLbs ?? 0,
              sex:               dogProfile?.sex ?? null,
              health_conditions: dogProfile?.healthConditions ?? [],
              medications:       dogProfile?.medications ?? '',
              normal_eating:     dogProfile?.normalEating ?? '',
              normal_energy:     dogProfile?.normalEnergy ?? '',
              vet_clinic:        dogProfile?.vetClinicName ?? '',
              // Cat-specific fields
              indoor_outdoor:    dogProfile?.indoorOutdoor ?? null,
              normal_litter_box: dogProfile?.normalLitterBox ?? null,
              normal_grooming:   dogProfile?.normalGrooming ?? null,
            },
            concern: {
              concern_types:         assessment.concernTypes,
              description:           assessment.additionalNotes,
              onset_timing:          assessment.onsetTiming,
              physical_symptoms:     assessment.physicalSymptoms,
              symptom_notes:         assessment.symptomNotes,
              recent_changes:        assessment.recentChanges,
              recent_changes_notes:  assessment.recentChangesNotes,
              worry_level:           assessment.worryLevel,
            },
          }),
        }).then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json() as Promise<AssessmentResult>
        })
      } else {
        apiCall = Promise.resolve(null)
      }

      const [, result] = await Promise.all([minDelay, apiCall])
      if (cancelled) return
      setCurrentAssessmentId(Date.now().toString())
      if (result) setAssessmentResult(result)
      router.push('/results')
    }

    run().catch(() => {
      if (!cancelled) setApiError(true)
    })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Error state ──
  if (apiError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-soft-cream px-6">
        <div className="bg-white rounded-card p-6 max-w-sm w-full text-center shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
          <div className="w-12 h-12 rounded-full bg-soft-red-bg flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} className="text-call-vet-red" />
          </div>
          <h2 className="text-[18px] font-semibold text-calm-navy mb-2">Something went wrong</h2>
          <p className="text-[15px] text-medium-gray leading-relaxed mb-5">
            We couldn&apos;t complete the assessment right now. Please check your connection and try again.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex-1 py-2.5 border-2 border-warm-gray rounded-button text-sm font-semibold text-medium-gray"
            >
              Go home
            </button>
            <button
              type="button"
              onClick={() => router.push('/concern')}
              className="flex-1 py-2.5 bg-pawcalm-teal rounded-button text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Loading state ──
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-soft-cream gap-6 px-6">

      {/* Breathing paw circle */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="w-[120px] h-[120px] bg-light-teal rounded-full flex items-center justify-center"
      >
        <PawPrint size={48} className="text-pawcalm-teal" />
      </motion.div>

      {/* Rotating microcopy */}
      <AnimatePresence mode="wait">
        <motion.p
          key={msgIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-[15px] text-medium-gray text-center"
        >
          {messages[msgIdx]}
        </motion.p>
      </AnimatePresence>

      {/* Fixed reassurance text */}
      <p className="text-[13px] text-medium-gray text-center -mt-2">
        We&apos;re putting together thoughtful guidance for {dogName}.
      </p>

    </div>
  )
}
