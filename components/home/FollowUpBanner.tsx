'use client'

import { useMemo, useState } from 'react'
import { useAppStore } from '@/store'
import type { ResolutionOutcome } from '@/store'
import ResolutionModal from './ResolutionModal'

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

function formatAge(date: Date): string {
  const ms    = Date.now() - date.getTime()
  const days  = Math.floor(ms / (24 * 60 * 60 * 1000))
  const hours = Math.floor(ms / (60 * 60 * 1000))
  if (days >= 2)  return `${days} days ago`
  if (days === 1) return '1 day ago'
  return `${hours} hour${hours === 1 ? '' : 's'} ago`
}

export default function FollowUpBanner() {
  const history          = useAppStore((s) => s.assessmentHistory)
  const activePetId      = useAppStore((s) => s.activePetId)
  const getActivePet     = useAppStore((s) => s.getActivePet)
  const resolveAssessment = useAppStore((s) => s.resolveAssessment)

  const [dismissed, setDismissed] = useState<string | null>(null)
  const [modalId,   setModalId]   = useState<string | null>(null)

  const activePet = getActivePet()

  // Find the most recent unresolved entry older than 24h for the active pet
  const pending = useMemo(() => {
    const cutoff = Date.now() - TWENTY_FOUR_HOURS
    return history
      .filter((e) => e.resolved === null && e.petId === activePetId && e.createdAt.getTime() < cutoff)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null
  }, [history, activePetId])

  // Nothing to show
  if (!pending || pending.id === dismissed) return null

  const dogName    = activePet?.name ?? 'your pup'
  const ageLabel   = formatAge(pending.createdAt)
  const modalEntry = modalId ? history.find((e) => e.id === modalId) ?? null : null

  function handleSave(outcome: ResolutionOutcome, notes: string) {
    if (!modalId) return
    resolveAssessment(modalId, outcome, notes)
  }

  function handleModalDismiss() {
    setModalId(null)
    // If the entry is now resolved, banner disappears naturally on next render
  }

  return (
    <>
      <div className="bg-light-teal rounded-card px-4 py-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-[16px] font-semibold text-calm-navy leading-snug">
            How is {dogName} doing?
          </h4>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setDismissed(pending.id)}
            className="text-[18px] leading-none text-calm-navy/40 hover:text-calm-navy/60 transition-colors shrink-0 mt-0.5"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <p className="text-[14px] text-calm-navy/80 leading-relaxed mb-4">
          You logged a concern about{' '}
          <span className="font-medium text-calm-navy">
            {pending.concernSummary.toLowerCase()}
          </span>{' '}
          {ageLabel}. How did it turn out?
        </p>

        {/* Buttons */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => setModalId(pending.id)}
            className="flex-1 py-2.5 bg-pawcalm-teal rounded-button text-[14px] font-semibold text-white"
          >
            Resolved! 🎉
          </button>
          <button
            type="button"
            onClick={() => setDismissed(pending.id)}
            className="flex-1 py-2.5 border-2 border-pawcalm-teal/30 bg-white/60 rounded-button text-[14px] font-semibold text-pawcalm-teal"
          >
            Still monitoring
          </button>
        </div>
      </div>

      {/* Resolution modal */}
      {modalEntry && (
        <ResolutionModal
          dogName={dogName}
          concernSummary={modalEntry.concernSummary}
          onSave={handleSave}
          onDismiss={handleModalDismiss}
        />
      )}
    </>
  )
}
