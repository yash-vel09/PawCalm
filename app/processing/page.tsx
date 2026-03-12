'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { PawPrint } from 'lucide-react'
import { useAppStore } from '@/store'
import { runAssessment } from '@/lib/mockAssessmentService'

const MESSAGES = (dogName: string) => [
  `Analyzing ${dogName}'s patterns...`,
  `Reviewing ${dogName}'s profile...`,
  'Checking behavioral patterns...',
  'Preparing your guidance...',
]

const MIN_DISPLAY_MS = 2500

export default function ProcessingPage() {
  const router              = useRouter()
  const dogProfile          = useAppStore((s) => s.dogProfile)
  const assessment          = useAppStore((s) => s.currentAssessment)
  const setAssessmentResult = useAppStore((s) => s.setAssessmentResult)

  const dogName  = dogProfile?.name ?? 'your dog'
  const messages = MESSAGES(dogName)

  const [msgIdx, setMsgIdx] = useState(0)

  // Cycle messages every 2 s
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % messages.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [messages.length])

  // Run API + enforce minimum display time, then navigate
  useEffect(() => {
    let cancelled = false

    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, MIN_DISPLAY_MS))
    const apiCall  = assessment ? runAssessment(assessment) : Promise.resolve(null)

    Promise.all([minDelay, apiCall]).then(([, result]) => {
      if (cancelled) return
      if (result) setAssessmentResult(result)
      router.push('/results')
    })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-soft-cream gap-6 px-6">

      {/* Breathing paw circle — scale + opacity pulse */}
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
