'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { X, Phone } from 'lucide-react'
import { useAppStore } from '@/store'
import type { ConcernAssessmentInput, ConcernType, Recommendation } from '@/store'

// ─── Labels ────────────────────────────────────────────────────────────────

const CONCERN_LABEL: Record<ConcernType, string> = {
  not_eating:      'Not eating / eating less',
  low_energy:      'Low energy / lethargy',
  vomiting:        'Vomiting / upset stomach',
  bathroom_issues: 'Bathroom issues',
  unusual_barking: 'Unusual barking / whining',
  aggression:      'Aggression / behavior changes',
  limping:         'Limping / mobility issues',
  something_else:  'Something else',
}

const ONSET_LABEL: Record<string, string> = {
  within_the_hour: 'Within the last hour',
  earlier_today:   'Earlier today',
  yesterday:       'Yesterday',
  few_days:        'A few days ago',
  week_or_more:    'A week or more ago',
}

const WORRY_LABEL: Record<number, string> = {
  1: '😌 Just curious',
  2: '🤔 A little concerned',
  3: '😟 Pretty worried',
  4: '😰 Very worried',
  5: '😨 Panicking',
}

function formatLabel(val: string): string {
  return val.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

// ─── Fallback recommendation derivation (no AI result) ─────────────────────

function deriveRec(a: ConcernAssessmentInput): Recommendation {
  const urgentSymptoms = a.physicalSymptoms.some((s) => s === 'swelling' || s === 'shaking')
  const urgentConcern  = a.concernTypes.some((c) => c === 'limping' || c === 'aggression' || c === 'vomiting')
  const acuteOnset     = a.onsetTiming === 'within_the_hour' || a.onsetTiming === 'earlier_today'
  if ((a.worryLevel ?? 0) >= 4 || urgentSymptoms || (urgentConcern && acuteOnset)) return 'call_vet'
  const hasSymptoms = a.physicalSymptoms.some((s) => s !== 'none')
  if ((a.worryLevel ?? 0) >= 3 || hasSymptoms) return 'try_this'
  return 'monitor'
}

// ─── UI config per recommendation ─────────────────────────────────────────

const REC_CONFIG: Record<Recommendation, {
  label: string; emoji: string; headline: string; summary: string
  heroBg: string; badge: string; accent: string; bar: string
}> = {
  monitor: {
    label:    'Monitor',
    emoji:    '👁️',
    headline: 'Keep a close eye on',
    summary:  "Based on what you've shared, this doesn't appear urgent right now. Stay observant and check back if anything changes.",
    heroBg:   'bg-soft-green-bg',
    badge:    'bg-soft-green-bg text-monitor-green border border-monitor-green/30',
    accent:   'text-monitor-green',
    bar:      'bg-monitor-green',
  },
  try_this: {
    label:    'Try This',
    emoji:    '💡',
    headline: 'A few things to try for',
    summary:  'There are steps you can take at home. Monitor the response over the next 24 hours before deciding on a vet visit.',
    heroBg:   'bg-soft-amber-bg',
    badge:    'bg-soft-amber-bg text-try-amber border border-try-amber/30',
    accent:   'text-try-amber',
    bar:      'bg-try-amber',
  },
  call_vet: {
    label:    'Call Vet',
    emoji:    '📞',
    headline: 'Best to call your vet about',
    summary:  "Based on what you've described, a professional should take a look. You're doing the right thing by checking.",
    heroBg:   'bg-soft-red-bg',
    badge:    'bg-soft-red-bg text-call-vet-red border border-call-vet-red/30',
    accent:   'text-call-vet-red',
    bar:      'bg-call-vet-red',
  },
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router           = useRouter()
  const dogProfile       = useAppStore((s) => s.dogProfile)
  const assessment       = useAppStore((s) => s.currentAssessment)
  const assessmentResult = useAppStore((s) => s.assessmentResult)
  const dogName          = dogProfile?.name ?? 'Your dog'

  const rec = useMemo(() => {
    if (assessmentResult) return assessmentResult.recommendation
    if (assessment) return deriveRec(assessment)
    return 'monitor' as Recommendation
  }, [assessmentResult, assessment])

  const cfg = REC_CONFIG[rec]

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-soft-cream gap-4 px-6">
        <p className="text-lg font-semibold text-calm-navy">No assessment found</p>
        <button type="button" onClick={() => router.push('/')} className="text-pawcalm-teal font-semibold">
          Go to Home
        </button>
      </div>
    )
  }

  const hasSymptoms = assessment.physicalSymptoms.some((s) => s !== 'none')
  const hasChanges  = assessment.recentChanges.some((c) => c !== 'nothing_changed')
  const hasVetQs    = (assessmentResult?.questions_for_vet ?? []).length > 0

  return (
    <div className="flex flex-col min-h-screen bg-soft-cream">

      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 pt-12 pb-4">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="p-2 -ml-2 rounded-full hover:bg-warm-gray transition-colors"
          aria-label="Close"
        >
          <X size={22} className="text-calm-navy" />
        </button>
        <span className="text-sm font-semibold text-medium-gray">Assessment Results</span>
        <div className="w-10" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">

        {/* Hero recommendation card */}
        <div className={`rounded-card p-6 ${cfg.heroBg}`}>
          <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 ${cfg.badge}`}>
            {cfg.label}
          </span>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{cfg.emoji}</span>
            <div>
              <p className="text-[13px] text-medium-gray leading-tight">{cfg.headline}</p>
              <h2 className="text-2xl font-bold text-calm-navy">{dogName}</h2>
            </div>
          </div>
          <p className="text-[15px] text-calm-navy leading-relaxed">
            {assessmentResult?.reassurance_note ?? cfg.summary}
          </p>
        </div>

        {/* You Reported */}
        <div className="bg-white rounded-card p-4">
          <p className="text-xs font-bold text-medium-gray uppercase tracking-wide mb-3">You Reported</p>
          <div className="space-y-2">
            {assessment.concernTypes.map((ct) => (
              <div key={ct} className="flex items-center gap-2.5">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.bar}`} />
                <span className="text-sm text-calm-navy">{CONCERN_LABEL[ct]}</span>
              </div>
            ))}
          </div>
          {assessment.additionalNotes && (
            <p className="mt-3 pt-3 border-t border-warm-gray text-sm text-medium-gray italic leading-relaxed">
              &ldquo;{assessment.additionalNotes}&rdquo;
            </p>
          )}
        </div>

        {/* What might be going on — AI only */}
        {assessmentResult && (
          <div className="bg-white rounded-card p-4">
            <p className="text-xs font-bold text-medium-gray uppercase tracking-wide mb-3">What Might Be Going On</p>
            <div className="space-y-3">
              {assessmentResult.likely_explanations.map((exp, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`shrink-0 w-5 h-5 rounded-full ${cfg.heroBg} flex items-center justify-center text-[11px] font-bold ${cfg.accent} mt-0.5`}>
                    {i + 1}
                  </div>
                  <p className="text-[15px] text-calm-navy leading-relaxed">{exp}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What to watch for — AI only */}
        {assessmentResult && (
          <div className="bg-white rounded-card p-4">
            <p className="text-xs font-bold text-medium-gray uppercase tracking-wide mb-3">What to Watch For</p>
            <div className="space-y-2.5">
              {assessmentResult.what_to_watch_for.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-[7px] ${cfg.bar}`} />
                  <p className="text-[15px] text-calm-navy leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Steps to take */}
        <div>
          <p className="text-xs font-bold text-medium-gray uppercase tracking-wide mb-3 px-1">Steps to Take</p>
          <div className="space-y-3">
            {(assessmentResult?.suggested_actions ?? []).map((action, i) => (
              <div key={i} className="bg-white rounded-card p-4 flex gap-3">
                <div className={`shrink-0 w-6 h-6 rounded-full ${cfg.heroBg} flex items-center justify-center text-xs font-bold ${cfg.accent} mt-0.5`}>
                  {i + 1}
                </div>
                <p className="text-[15px] text-calm-navy leading-relaxed">{action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Questions for your vet — AI only, non-empty */}
        {hasVetQs && (
          <div className="bg-white rounded-card p-4">
            <p className="text-xs font-bold text-medium-gray uppercase tracking-wide mb-3">Questions for Your Vet</p>
            <div className="space-y-3">
              {assessmentResult!.questions_for_vet.map((q, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={`text-sm font-bold ${cfg.accent} shrink-0 mt-0.5`}>Q</span>
                  <p className="text-[15px] text-calm-navy leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assessment details */}
        <div className="bg-white rounded-card p-4">
          <p className="text-xs font-bold text-medium-gray uppercase tracking-wide mb-3">Details</p>
          <div className="space-y-3">
            {assessment.onsetTiming && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-medium-gray">Started</span>
                <span className="text-sm font-medium text-calm-navy">{ONSET_LABEL[assessment.onsetTiming]}</span>
              </div>
            )}
            {assessment.worryLevel && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-medium-gray">Worry level</span>
                <span className="text-sm font-medium text-calm-navy">{WORRY_LABEL[assessment.worryLevel]}</span>
              </div>
            )}
            {hasSymptoms && (
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-medium-gray shrink-0">Symptoms</span>
                <span className="text-sm font-medium text-calm-navy text-right">
                  {assessment.physicalSymptoms.filter((s) => s !== 'none').map(formatLabel).join(', ')}
                </span>
              </div>
            )}
            {hasChanges && (
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-medium-gray shrink-0">Recent changes</span>
                <span className="text-sm font-medium text-calm-navy text-right">
                  {assessment.recentChanges.filter((c) => c !== 'nothing_changed').map(formatLabel).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-medium-gray text-center leading-relaxed px-2 pb-2">
          This is general guidance only and is not a substitute for professional veterinary advice. When in doubt, always contact your vet.
        </p>

      </div>

      {/* Sticky footer */}
      <div className="shrink-0 px-4 pb-8 pt-3 bg-soft-cream border-t border-warm-gray">
        {rec === 'call_vet' ? (
          <div className="space-y-2.5">
            <button
              type="button"
              className="w-full min-h-[52px] rounded-button bg-call-vet-red text-white text-[15px] font-semibold flex items-center justify-center gap-2"
            >
              <Phone size={18} />
              {dogProfile?.vetClinicName ? `Call ${dogProfile.vetClinicName}` : 'Call Your Vet'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full py-2 text-sm font-medium text-medium-gray text-center"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full min-h-[52px] rounded-button bg-pawcalm-teal text-white text-[15px] font-semibold"
            >
              Back to Home
            </button>
            <button
              type="button"
              onClick={() => router.push('/concern')}
              className="w-full py-2 text-sm font-medium text-medium-gray text-center"
            >
              Log another concern
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
