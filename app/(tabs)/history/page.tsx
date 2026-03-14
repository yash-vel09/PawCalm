'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, FileDown, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store'
import type { Recommendation } from '@/store'
import { useToast } from '@/lib/toast'

// ─── Types ─────────────────────────────────────────────────────────────────

type RecFilter = 'all' | Recommendation
type PetFilter = 'all' | string  // petId

const REC_FILTERS: { value: RecFilter; label: string }[] = [
  { value: 'all',      label: 'All' },
  { value: 'monitor',  label: '🟢 Monitor' },
  { value: 'try_this', label: '🟡 Try This' },
  { value: 'call_vet', label: '🔴 Call Vet' },
]

const REC_BADGE: Record<Recommendation, { label: string; bg: string; dot: string }> = {
  monitor:  { label: 'Monitor',  bg: 'bg-monitor-green',  dot: 'bg-monitor-green' },
  try_this: { label: 'Try This', bg: 'bg-try-amber',      dot: 'bg-try-amber' },
  call_vet: { label: 'Call Vet', bg: 'bg-call-vet-red',   dot: 'bg-call-vet-red' },
}

// ─── Date helpers ──────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function relativeTime(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)  return `${days} days ago`
  if (days < 14) return '1 week ago'
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  const months = Math.floor(days / 30)
  return `${months} month${months > 1 ? 's' : ''} ago`
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const router      = useRouter()
  const pets        = useAppStore((s) => s.pets)
  const activePetId = useAppStore((s) => s.activePetId)
  const history     = useAppStore((s) => s.assessmentHistory)
  const activePet   = pets.find((p) => p.id === activePetId) ?? pets[0] ?? null
  const petName     = activePet?.name ?? 'your pet'

  const [recFilter, setRecFilter] = useState<RecFilter>('all')
  const [petFilter, setPetFilter] = useState<PetFilter>(activePetId ?? 'all')
  const { show } = useToast()

  const showingAll = petFilter === 'all'

  const petById = useMemo(() => {
    const map: Record<string, typeof pets[0]> = {}
    pets.forEach((p) => { map[p.id] = p })
    return map
  }, [pets])

  const sorted = useMemo(
    () => [...history].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [history],
  )

  const filtered = useMemo(() => {
    let result = sorted
    if (!showingAll) result = result.filter((e) => e.petId === petFilter)
    if (recFilter !== 'all') result = result.filter((e) => e.recommendation === recFilter)
    return result
  }, [sorted, petFilter, recFilter, showingAll])

  function handleExport() {
    show('Export coming soon')
  }

  const displayedPetName = showingAll
    ? 'All pets'
    : (petById[petFilter]?.name ?? petName)

  return (
    <div className="flex flex-col bg-soft-cream min-h-[calc(100vh-64px)]">

      {/* ── Header ── */}
      <div className="px-4 pt-12 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-calm-navy">Assessment History</h1>
          <p className="text-[15px] text-medium-gray mt-0.5">
            {showingAll ? 'All pets' : `${displayedPetName}'s concern timeline`}
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-1.5 border border-warm-gray bg-white rounded-button px-3 py-2 text-sm font-semibold text-calm-navy mt-1 shrink-0"
        >
          <FileDown size={15} />
          Export
        </button>
      </div>

      {/* ── Pet filter bar (only when multiple pets) ── */}
      {pets.length > 1 && (
        <div className="px-4 pb-3 overflow-x-auto scrollbar-none">
          <div className="flex gap-2 w-max">
            <button
              type="button"
              onClick={() => setPetFilter('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                showingAll ? 'bg-calm-navy text-white' : 'bg-warm-gray text-calm-navy'
              }`}
            >
              All Pets
            </button>
            {pets.map((pet) => {
              const active = petFilter === pet.id
              return (
                <button
                  key={pet.id}
                  type="button"
                  onClick={() => setPetFilter(pet.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                    active ? 'bg-pawcalm-teal text-white' : 'bg-warm-gray text-calm-navy'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    active ? 'bg-white/20 text-white' : 'bg-pawcalm-teal/10 text-pawcalm-teal'
                  }`}>
                    {pet.name[0].toUpperCase()}
                  </span>
                  {pet.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Rec filter bar ── */}
      <div className="px-4 pb-5 overflow-x-auto scrollbar-none">
        <div className="flex gap-2 w-max">
          {REC_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setRecFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                recFilter === f.value
                  ? 'bg-pawcalm-teal text-white'
                  : 'bg-warm-gray text-calm-navy'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 px-4 pb-8">
        {filtered.length === 0 ? (

          /* Empty state */
          <div className="flex flex-col items-center justify-center pt-16 text-center px-4">
            <div className="w-20 h-20 rounded-full bg-warm-gray flex items-center justify-center mb-5">
              <Clock size={32} className="text-medium-gray" />
            </div>
            <h3 className="text-[18px] font-semibold text-calm-navy mb-2">
              {recFilter !== 'all' ? 'No matching assessments' : 'No assessments yet'}
            </h3>
            <p className="text-[15px] text-medium-gray leading-relaxed mb-6 max-w-xs">
              {recFilter !== 'all'
                ? `No ${REC_FILTERS.find((f2) => f2.value === recFilter)?.label} assessments found. Try a different filter.`
                : showingAll
                ? 'When something worries you about your pets, your assessment history will appear here.'
                : `No assessments yet for ${displayedPetName}. When something worries you about ${displayedPetName}, your assessment history will appear here.`}
            </p>
            {recFilter === 'all' && (
              <button
                type="button"
                onClick={() => router.push('/concern')}
                className="bg-pawcalm-teal text-white text-[15px] font-semibold px-6 py-3 rounded-button"
              >
                Log your first concern
              </button>
            )}
          </div>

        ) : (

          /* Timeline */
          <div>
            {filtered.map((entry, i) => {
              const isLast   = i === filtered.length - 1
              const badge    = REC_BADGE[entry.recommendation]
              const entryPet = entry.petId ? petById[entry.petId] : null
              return (
                <div key={entry.id} className="flex">
                  {/* Timeline column: dot + connector */}
                  <div className="flex flex-col items-center w-8 shrink-0">
                    <div className={`w-3 h-3 rounded-full mt-5 shrink-0 border-2 border-soft-cream ${badge.dot}`} />
                    {!isLast && <div className="w-0.5 flex-1 bg-warm-gray mt-1 min-h-[20px]" />}
                  </div>

                  {/* Card */}
                  <div className={`flex-1 ml-3 ${isLast ? 'pb-2' : 'pb-4'}`}>
                    <button
                      type="button"
                      onClick={() => router.push(`/assessment/${entry.id}`)}
                      className="w-full text-left"
                    >
                      <div className="bg-white rounded-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                        {/* Top row */}
                        <div className="flex items-center justify-between mb-2.5">
                          <span className={`${badge.bg} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                            {badge.label}
                          </span>
                          <div className="flex items-center gap-2">
                            {showingAll && entryPet && (
                              <div className="flex items-center gap-1">
                                <span className="text-[13px]">
                                  {entryPet.type === 'cat' ? '🐱' : '🐕'}
                                </span>
                                <span className="text-[12px] font-semibold text-medium-gray">
                                  {entryPet.name}
                                </span>
                              </div>
                            )}
                            <ChevronRight size={16} className="text-medium-gray" />
                          </div>
                        </div>

                        {/* Concern summary */}
                        <p className="text-[16px] font-semibold text-calm-navy leading-snug mb-2">
                          {entry.concernSummary}
                        </p>

                        {/* Date + resolution */}
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[13px] text-medium-gray">
                            {formatDate(entry.createdAt)} · {relativeTime(entry.createdAt)}
                          </p>
                          {entry.resolved === true && (
                            <span className="text-[12px] font-semibold text-monitor-green shrink-0">Resolved ✓</span>
                          )}
                          {entry.resolved === false && (
                            <span className="text-[12px] font-semibold text-medium-gray shrink-0">Unresolved</span>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

        )}
      </div>

    </div>
  )
}
