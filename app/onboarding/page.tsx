'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useAppStore, DogProfile, DogProfileDraft } from '@/store'
import { saveDogProfile } from '@/lib/mockDataService'
import ProgressBar from '@/components/onboarding/ProgressBar'
import Step1_NamePhoto from '@/components/onboarding/Step1_NamePhoto'
import Step2_Details from '@/components/onboarding/Step2_Details'
import Step3_Baseline from '@/components/onboarding/Step3_Baseline'
import Step4_Health from '@/components/onboarding/Step4_Health'
import Step5_Complete from '@/components/onboarding/Step5_Complete'

const variants = {
  enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? '-100%' : '100%', opacity: 0 }),
}

function validateStep1(draft: DogProfileDraft): Record<string, string> {
  const errs: Record<string, string> = {}
  if (!draft.name?.trim()) errs.name = 'Please enter your dog\'s name'
  return errs
}

function validateStep2(draft: DogProfileDraft): Record<string, string> {
  const errs: Record<string, string> = {}
  if (!draft.breed?.trim()) errs.breed = 'Please select a breed'
  if (!draft.isPuppy && (draft.ageYears == null || draft.ageYears <= 0))
    errs.ageYears = 'Please enter your dog\'s age'
  if (!draft.weightLbs || draft.weightLbs <= 0) errs.weightLbs = 'Please enter a valid weight'
  if (!draft.sex) errs.sex = 'Please select a sex'
  if (!draft.spayedNeutered) errs.spayedNeutered = 'Please make a selection'
  return errs
}

function validateStep3(draft: DogProfileDraft): Record<string, string> {
  const errs: Record<string, string> = {}
  if (!draft.normalEating) errs.normalEating = 'Please select an eating pattern'
  if (!draft.normalEnergy) errs.normalEnergy = 'Please select an energy level'
  if (!draft.normalMood) errs.normalMood = 'Please select a mood pattern'
  return errs
}

function buildProfile(draft: DogProfileDraft): DogProfile {
  return {
    id: crypto.randomUUID(),
    name: draft.name!,
    photoUrl: draft.photoUrl ?? null,
    breed: draft.breed!,
    isPuppy: draft.isPuppy ?? false,
    ageYears: draft.ageYears ?? null,
    weightLbs: draft.weightLbs!,
    sex: draft.sex!,
    spayedNeutered: draft.spayedNeutered!,
    normalEating: draft.normalEating!,
    normalEnergy: draft.normalEnergy!,
    normalMood: draft.normalMood!,
    healthConditions: draft.healthConditions ?? [],
    medications: draft.medications ?? '',
    vetClinicName: draft.vetClinicName ?? '',
    type: 'dog',
    createdAt: new Date().toISOString(),
  }
}

export default function OnboardingPage() {
  const router = useRouter()
  const setDogProfile = useAppStore((s) => s.setDogProfile)

  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [draft, setDraft] = useState<DogProfileDraft>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [completedProfile, setCompletedProfile] = useState<DogProfile | null>(null)

  function updateDraft(updates: Partial<DogProfileDraft>) {
    setDraft((prev) => ({ ...prev, ...updates }))
    // Clear related errors
    const keys = Object.keys(updates)
    setErrors((prev) => {
      const next = { ...prev }
      keys.forEach((k) => delete next[k])
      return next
    })
  }

  function goBack() {
    if (step <= 1) return
    setErrors({})
    setDirection(-1)
    setStep((s) => s - 1)
  }

  function goNext() {
    let errs: Record<string, string> = {}
    if (step === 1) errs = validateStep1(draft)
    if (step === 2) errs = validateStep2(draft)
    if (step === 3) errs = validateStep3(draft)

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setErrors({})

    if (step === 3) {
      // Build snapshot before entering step 5
      const profile = buildProfile(draft)
      setCompletedProfile(profile)
      setDirection(1)
      setStep(4)
      return
    }

    setDirection(1)
    setStep((s) => s + 1)
  }

  function skipStep4() {
    const profile = completedProfile ?? buildProfile(draft)
    setCompletedProfile(profile)
    setDirection(1)
    setStep(5)
  }

  function advanceFromStep4() {
    // Step 4 has no validation — build/update profile with health data and go to step 5
    const base = completedProfile ?? buildProfile(draft)
    const updated: DogProfile = {
      ...base,
      healthConditions: draft.healthConditions ?? [],
      medications: draft.medications ?? '',
      vetClinicName: draft.vetClinicName ?? '',
    }
    setCompletedProfile(updated)
    setDirection(1)
    setStep(5)
  }

  async function handleComplete() {
    if (!completedProfile) return
    setIsLoading(true)
    try {
      await saveDogProfile(completedProfile)
      setDogProfile(completedProfile)
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  // Map internal step (1-5 data/confirm) to display step (1-4 for progress bar)
  const displayStep = step // steps 1-4 = data; step 5 = complete
  const showProgress = step < 5
  const showHeader = step < 5

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-soft-cream">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between px-4 pt-10 pb-4 shrink-0">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1}
            className="p-2 -ml-2 rounded-full disabled:opacity-0 transition-opacity"
            aria-label="Go back"
          >
            <ChevronLeft size={24} className="text-calm-navy" />
          </button>
          <span className="text-sm font-semibold text-medium-gray">
            Step {displayStep} of 4
          </span>
          <div className="w-10" />
        </div>
      )}

      {/* Progress bar */}
      {showProgress && (
        <div className="px-4 pb-4 shrink-0">
          <ProgressBar currentStep={displayStep} />
        </div>
      )}

      {/* Step content */}
      <div className="relative flex-1 overflow-x-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="absolute inset-0 overflow-y-auto"
          >
            {step === 1 && (
              <Step1_NamePhoto draft={draft} onChange={updateDraft} errors={errors} />
            )}
            {step === 2 && (
              <Step2_Details draft={draft} onChange={updateDraft} errors={errors} />
            )}
            {step === 3 && (
              <Step3_Baseline draft={draft} onChange={updateDraft} errors={errors} />
            )}
            {step === 4 && (
              <Step4_Health draft={draft} onChange={updateDraft} />
            )}
            {step === 5 && completedProfile && (
              <Step5_Complete
                profile={completedProfile}
                onConfirm={handleComplete}
                isLoading={isLoading}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer — steps 1-4 only */}
      {step < 5 && (
        <div className="px-4 pb-8 pt-2 shrink-0 bg-soft-cream">
          <button
            type="button"
            onClick={step === 4 ? advanceFromStep4 : goNext}
            className="w-full bg-pawcalm-teal text-white font-bold py-3.5 rounded-button"
          >
            {step === 4 ? 'Save & continue' : 'Continue'}
          </button>
          {step === 4 && (
            <button
              type="button"
              onClick={skipStep4}
              className="w-full text-center text-sm text-medium-gray font-semibold mt-3"
            >
              Skip for now
            </button>
          )}
        </div>
      )}
    </div>
  )
}
