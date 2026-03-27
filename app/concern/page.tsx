'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useAppStore } from '@/store'
import type { ConcernAssessmentInput, OnsetTiming, PhysicalSymptom, RecentChange } from '@/store'
import ProgressBar from '@/components/onboarding/ProgressBar'
import Step1_WhatHappening from '@/components/concern/Step1_WhatHappening'
import Step2_WhenStarted from '@/components/concern/Step2_WhenStarted'
import Step3_PhysicalSymptoms from '@/components/concern/Step3_PhysicalSymptoms'
import Step4_RecentChanges from '@/components/concern/Step4_RecentChanges'
import Step5_WorryLevel from '@/components/concern/Step5_WorryLevel'

const fadeVariants = {
  enter:  { opacity: 0, y: 8 },
  center: { opacity: 1, y: 0 },
  exit:   { opacity: 0, y: -8 },
}

export default function ConcernPage() {
  const router = useRouter()
  const getActivePet = useAppStore((s) => s.getActivePet)
  const setCurrentAssessment = useAppStore((s) => s.setCurrentAssessment)

  const activePet = getActivePet()
  const petName = activePet?.name ?? 'your pet'
  const petType = activePet?.type ?? 'dog'

  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<Partial<ConcernAssessmentInput>>({
    concernTypes: [],
    additionalNotes: '',
    physicalSymptoms: [],
    symptomNotes: '',
    recentChanges: [],
    recentChangesNotes: '',
    onsetTiming: null,
    worryLevel: null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function updateDraft(u: Partial<ConcernAssessmentInput>) {
    setDraft((prev) => ({ ...prev, ...u }))
  }

  function validate(): boolean {
    const next: Record<string, string> = {}

    if (step === 1) {
      const types = draft.concernTypes ?? []
      if (types.length === 0) {
        next.concernTypes = 'Please select at least one concern'
      }
      if (types.includes('something_else') && !(draft.additionalNotes ?? '').trim()) {
        next.additionalNotes = 'Please describe what is happening'
      }
    }

    if (step === 2) {
      if (!draft.onsetTiming) {
        next.onsetTiming = 'Please select when you first noticed this'
      }
    }

    if (step === 5) {
      if (!draft.worryLevel) {
        next.worryLevel = 'Please select your worry level'
      }
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleContinue() {
    if (!validate()) return
    setStep((s) => s + 1)
  }

  function handleSkip() {
    setErrors({})
    setStep((s) => s + 1)
  }

  function handleBack() {
    setErrors({})
    if (step === 1) {
      router.back()
    } else {
      setStep((s) => s - 1)
    }
  }

  function handleSubmit() {
    if (!validate()) return

    const input: ConcernAssessmentInput = {
      petType,
      concernTypes: draft.concernTypes ?? [],
      additionalNotes: draft.additionalNotes ?? '',
      onsetTiming: draft.onsetTiming ?? null,
      physicalSymptoms: draft.physicalSymptoms ?? [],
      symptomNotes: draft.symptomNotes ?? '',
      recentChanges: draft.recentChanges ?? [],
      recentChangesNotes: draft.recentChangesNotes ?? '',
      worryLevel: draft.worryLevel ?? null,
    }

    setCurrentAssessment(input)
    router.push('/processing')
  }

  const showSkip = step === 3 || step === 4

  return (
    <div className="flex flex-col min-h-screen bg-soft-cream overflow-x-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 pt-12 pb-2">
        <button
          type="button"
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full hover:bg-warm-gray transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={24} className="text-calm-navy" />
        </button>
        <span className="text-sm text-medium-gray font-semibold">Step {step} of 5</span>
      </div>

      {/* Progress bar */}
      <div className="shrink-0 px-4 pb-4">
        <ProgressBar currentStep={step} totalSteps={5} />
      </div>

      {/* Animated content area */}
      <div className="flex-1 relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={fadeVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="absolute inset-0 overflow-y-auto px-4 pt-4 pb-4"
          >
            {step === 1 && (
              <Step1_WhatHappening
                draft={draft}
                onChange={updateDraft}
                errors={errors}
                petName={petName}
                petType={petType}
              />
            )}
            {step === 2 && (
              <Step2_WhenStarted
                value={draft.onsetTiming as OnsetTiming | null}
                onChange={(v) => updateDraft({ onsetTiming: v })}
                error={errors.onsetTiming}
              />
            )}
            {step === 3 && (
              <Step3_PhysicalSymptoms
                values={draft.physicalSymptoms as PhysicalSymptom[]}
                onChange={(v) => updateDraft({ physicalSymptoms: v })}
                petType={petType}
                symptomNotes={draft.symptomNotes ?? ''}
                onSymptomNotesChange={(v) => updateDraft({ symptomNotes: v })}
              />
            )}
            {step === 4 && (
              <Step4_RecentChanges
                values={draft.recentChanges as RecentChange[]}
                onChange={(v) => updateDraft({ recentChanges: v })}
                recentChangesNotes={draft.recentChangesNotes ?? ''}
                onRecentChangesNotesChange={(v) => updateDraft({ recentChangesNotes: v })}
              />
            )}
            {step === 5 && (
              <Step5_WorryLevel
                value={draft.worryLevel as 1 | 2 | 3 | 4 | 5 | null}
                onChange={(v) => updateDraft({ worryLevel: v })}
                error={errors.worryLevel}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-4 pb-8 pt-2 bg-soft-cream">
        {step < 5 ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleContinue}
              className="w-full min-h-[52px] rounded-button bg-pawcalm-teal text-white text-[15px] font-semibold transition-opacity active:opacity-80"
            >
              Continue
            </button>
            {showSkip && (
              <button
                type="button"
                onClick={handleSkip}
                className="w-full py-2 text-sm font-medium text-medium-gray"
              >
                Skip
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full min-h-[52px] rounded-button bg-pawcalm-teal text-white text-[15px] font-semibold transition-opacity active:opacity-80"
          >
            Get Guidance
          </button>
        )}
      </div>
    </div>
  )
}
