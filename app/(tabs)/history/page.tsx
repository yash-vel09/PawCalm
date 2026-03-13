'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, FileDown, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store'
import type { Recommendation } from '@/store'
import { useToast } from '@/lib/toast'

// ─── Types ─────────────────────────────────────────────────────────────────

type FilterValue = 'all' | Recommendation

const FILTERS: { value: FilterValue; label: string }[] = [
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
  const router     = useRouter()
  const dogProfile = useAppStore((s) => s.dogProfile)
  const history    = useAppStore((s) => s.assessmentHistory)
  const dogName    = dogProfile?.name ?? 'Your dog'

  const [filter, setFilter] = useState<FilterValue>('all')
  const { show } = useToast()

  const sorted = useMemo(
    () => [...history].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [history],
  )

  const filtered = useMemo(
    () => filter === 'all' ? sorted : sorted.filter((e) => e.recommendation === filter),
    [sorted, filter],
  )

  function handleExport() {
    show('Export coming soon')
  }

  return (
    <div className="flex flex-col bg-soft-cream min-h-[calc(100vh-64px)]">

      {/* ── Header ── */}
      <div className="px-4 pt-12 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-calm-navy">Assessment History</h1>
          <p className="text-[15px] text-medium-gray mt-0.5">{dogName}&apos;s concern timeline</p>
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

      {/* ── Filter bar ── */}
      <div className="px-4 pb-5 overflow-x-auto scrollbar-none">
        <div className="flex gap-2 w-max">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                filter === f.value
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
              {filter === 'all' ? 'No assessments yet' : 'No matching assessments'}
            </h3>
            <p className="text-[15px] text-medium-gray leading-relaxed mb-6 max-w-xs">
              {filter === 'all'
                ? `When something worries you about ${dogName}, your assessment history will appear here.`
                : `No ${FILTERS.find((f2) => f2.value === filter)?.label} assessments found. Try a different filter.`}
            </p>
            {filter === 'all' && (
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
              const isLast  = i === filtered.length - 1
              const badge   = REC_BADGE[entry.recommendation]
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
                          <ChevronRight size={16} className="text-medium-gray" />
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
