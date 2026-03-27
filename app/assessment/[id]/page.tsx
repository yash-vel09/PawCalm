'use client'

import { useState } from 'react'
import { useAppStore } from '@/store'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, CheckCircle, Stethoscope, Phone, Search, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react'
import type { Recommendation, ConcernAssessmentInput, ConcernType } from '@/store'

// ─── Label maps ────────────────────────────────────────────────────────────

const CONCERN_LABEL: Record<ConcernType, string> = {
  not_eating:        'Not eating / eating less',
  low_energy:        'Low energy / lethargy',
  vomiting:          'Vomiting / upset stomach',
  bathroom_issues:   'Bathroom issues',
  unusual_barking:   'Unusual barking / whining',
  aggression:        'Aggression / behavior changes',
  limping:           'Limping / mobility issues',
  something_else:    'Something else',
  litter_box_changes: 'Litter box changes',
  hiding:             'Hiding more than usual',
  excessive_grooming: 'Excessive grooming / fur loss',
  excessive_meowing:  'Excessive meowing / vocalization',
  hairballs:          'Vomiting / hairballs',
}
const ONSET_LABEL: Record<string, string> = {
  within_the_hour: 'Within the last hour',
  earlier_today:   'Earlier today',
  yesterday:       'Yesterday',
  few_days:        'A few days ago',
  week_or_more:    'A week or more ago',
}
const SYMPTOM_LABEL: Record<string, string> = {
  excessive_drooling: 'Excessive drooling', shaking: 'Shaking / trembling',
  coughing: 'Coughing', sneezing: 'Sneezing', eye_discharge: 'Eye discharge',
  swelling: 'Swelling', skin_changes: 'Skin changes', bad_breath: 'Bad breath',
  excessive_thirst: 'Excessive thirst', weight_change: 'Weight change',
  diarrhea: 'Diarrhea', constipation: 'Constipation',
  straining_litter_box: 'Straining in litter box', blood_in_urine: 'Blood in urine',
  watery_eyes: 'Watery eyes', bald_patches: 'Skin changes / bald patches', drooling: 'Drooling (unusual)',
}
const CHANGE_LABEL: Record<string, string> = {
  new_food: 'New food or treats', moved_home: 'Moved to new home',
  new_pet: 'New pet in household', new_family_member: 'New baby / family member',
  schedule_change: 'Change in schedule', boarding_travel: 'Recent boarding / travel',
  weather_change: 'Weather change', new_medication: 'New medication',
  vet_visit: 'Recent vet visit', loss_of_companion: 'Loss of companion',
}

// ─── Input summary helper ──────────────────────────────────────────────────

function InputRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-medium-gray uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-[14px] text-calm-navy leading-snug">{value}</p>
    </div>
  )
}

function ConcernDetailsCard({ assessment }: { assessment: ConcernAssessmentInput }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5"
      >
        <div className="flex items-center gap-2">
          <ClipboardList size={15} className="text-medium-gray" />
          <span className="text-xs font-bold text-medium-gray uppercase tracking-wide">Your Concern Details</span>
        </div>
        {open ? <ChevronUp size={16} className="text-medium-gray" /> : <ChevronDown size={16} className="text-medium-gray" />}
      </button>
      {open && (
        <div className="border-t border-warm-gray px-4 pt-3 pb-4 space-y-3">
          <InputRow label="Concern" value={assessment.concernTypes.map(t => CONCERN_LABEL[t]).join(', ')} />
          {assessment.additionalNotes.trim() && (
            <InputRow label="Additional context" value={assessment.additionalNotes.trim()} />
          )}
          {assessment.onsetTiming && (
            <InputRow label="When it started" value={ONSET_LABEL[assessment.onsetTiming] ?? assessment.onsetTiming} />
          )}
          {assessment.physicalSymptoms.some(s => s !== 'none') && (
            <InputRow
              label="Physical symptoms"
              value={assessment.physicalSymptoms.filter(s => s !== 'none').map(s => SYMPTOM_LABEL[s] ?? s).join(', ')}
            />
          )}
          {assessment.symptomNotes.trim() && (
            <InputRow label="Symptom details" value={assessment.symptomNotes.trim()} />
          )}
          {assessment.recentChanges.some(c => c !== 'nothing_changed') && (
            <InputRow
              label="Recent changes"
              value={assessment.recentChanges.filter(c => c !== 'nothing_changed').map(c => CHANGE_LABEL[c] ?? c).join(', ')}
            />
          )}
          {assessment.recentChangesNotes.trim() && (
            <InputRow label="Change details" value={assessment.recentChangesNotes.trim()} />
          )}
          {assessment.worryLevel && (
            <InputRow label="Worry level" value={`${assessment.worryLevel} out of 5`} />
          )}
        </div>
      )}
    </div>
  )
}

// ─── Config (mirrors results page) ────────────────────────────────────────

const REC_CONFIG: Record<Recommendation, {
  label: string; headline: string
  heroBg: string; badge: string; borderL: string; accent: string; circle: string; dot: string
}> = {
  monitor: {
    label:   'Monitor',
    headline: 'Take a breath — this looks manageable',
    heroBg:  'bg-soft-green-bg',
    badge:   'bg-monitor-green',
    borderL: 'border-l-monitor-green',
    accent:  'text-monitor-green',
    circle:  'bg-soft-green-bg',
    dot:     'bg-monitor-green',
  },
  try_this: {
    label:   'Try This',
    headline: 'Here are some things that may help',
    heroBg:  'bg-soft-amber-bg',
    badge:   'bg-try-amber',
    borderL: 'border-l-try-amber',
    accent:  'text-try-amber',
    circle:  'bg-soft-amber-bg',
    dot:     'bg-try-amber',
  },
  call_vet: {
    label:   'Call Vet',
    headline: "We'd recommend checking in with your vet",
    heroBg:  'bg-soft-red-bg',
    badge:   'bg-call-vet-red',
    borderL: 'border-l-call-vet-red',
    accent:  'text-call-vet-red',
    circle:  'bg-soft-red-bg',
    dot:     'bg-call-vet-red',
  },
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

export default function AssessmentDetailPage({ params }: { params: { id: string } }) {
  const router     = useRouter()
  const dogProfile = useAppStore((s) => s.dogProfile)
  const history    = useAppStore((s) => s.assessmentHistory)

  const entry = history.find((e) => e.id === params.id)

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-soft-cream px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-light-teal flex items-center justify-center mb-5">
          <Search size={32} className="text-pawcalm-teal" />
        </div>
        <h2 className="text-[18px] font-semibold text-calm-navy mb-2">Assessment not found</h2>
        <p className="text-[15px] text-medium-gray leading-relaxed mb-6 max-w-xs">
          This record may have been removed or the link is no longer valid.
        </p>
        <button
          type="button"
          onClick={() => router.push('/history')}
          className="bg-pawcalm-teal text-white text-[15px] font-semibold px-6 py-3 rounded-button"
        >
          Back to History
        </button>
      </div>
    )
  }

  const cfg      = REC_CONFIG[entry.recommendation]
  const result   = entry.result
  const actions  = result?.suggested_actions ?? []
  const questions = result?.questions_for_vet ?? []
  const showVetQs = (entry.recommendation === 'try_this' || entry.recommendation === 'call_vet') && questions.length > 0

  return (
    <div className="flex flex-col min-h-screen bg-soft-cream">

      {/* ── Section 1: Colored header ── */}
      <div className={`relative border-l-4 ${cfg.borderL} ${cfg.heroBg} rounded-b-[24px] px-5 pt-14 pb-8`}>
        <button
          type="button"
          onClick={() => router.push('/history')}
          className="absolute top-12 left-4 p-2 rounded-full hover:bg-black/5 transition-colors"
          aria-label="Back to history"
        >
          <ArrowLeft size={22} className="text-calm-navy" />
        </button>

        <div className="flex justify-center mb-4">
          <span className={`${cfg.badge} text-white text-xs font-bold px-4 py-1.5 rounded-full`}>
            {cfg.label}
          </span>
        </div>

        <h2 className="text-[22px] font-bold text-calm-navy text-center mt-4">
          {entry.concernSummary}
        </h2>

        <p className="text-[13px] text-medium-gray text-center mt-1.5">
          {formatDate(entry.createdAt)} · {relativeTime(entry.createdAt)}
          {entry.resolved === true && (
            <span className="ml-2 text-monitor-green font-semibold">· Resolved ✓</span>
          )}
          {entry.resolved === false && (
            <span className="ml-2 font-semibold">· Unresolved</span>
          )}
        </p>

        {result?.reassurance_note && (
          <p className="text-[15px] text-calm-navy/80 leading-relaxed text-center mt-3">
            {result.reassurance_note}
          </p>
        )}
      </div>

      {/* ── Scrollable sections ── */}
      <div className={`flex-1 overflow-y-auto px-4 pt-5 space-y-4 ${entry.recommendation === 'call_vet' ? 'pb-28' : 'pb-8'}`}>

        {/* Your Concern Details */}
        {entry.assessment && <ConcernDetailsCard assessment={entry.assessment} />}

        {/* What might have been going on */}
        {result && result.likely_explanations.length > 0 && (
          <div className="bg-white rounded-card p-4">
            <p className="text-xs font-bold text-medium-gray uppercase tracking-wide mb-4">What Might Have Been Going On</p>
            <div className="space-y-3">
              {result.likely_explanations.map((exp, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`shrink-0 w-6 h-6 rounded-full ${cfg.circle} flex items-center justify-center text-[11px] font-bold ${cfg.accent} mt-0.5`}>
                    {i + 1}
                  </div>
                  <p className="text-[15px] text-calm-navy leading-relaxed">{exp}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What to watch for */}
        {result && result.what_to_watch_for.length > 0 && (
          <div className="bg-white rounded-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Eye size={16} className={cfg.accent} />
              <p className="text-xs font-bold text-medium-gray uppercase tracking-wide">What to Watch For</p>
            </div>
            <div className="space-y-2.5">
              {result.what_to_watch_for.map((watch, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-[7px] ${cfg.dot}`} />
                  <p className="text-[15px] text-calm-navy leading-relaxed">{watch}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested actions */}
        {actions.length > 0 && (
          <div className="bg-white rounded-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={16} className={cfg.accent} />
              <p className="text-xs font-bold text-medium-gray uppercase tracking-wide">Suggested Actions</p>
            </div>
            <div className="space-y-2.5">
              {actions.map((action, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`shrink-0 w-6 h-6 rounded-full ${cfg.circle} flex items-center justify-center text-[11px] font-bold ${cfg.accent} mt-0.5`}>
                    {i + 1}
                  </div>
                  <p className="text-[15px] text-calm-navy leading-relaxed">{action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions for vet */}
        {showVetQs && (
          <div className="bg-white rounded-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope size={16} className={cfg.accent} />
              <p className="text-xs font-bold text-medium-gray uppercase tracking-wide">Questions for Your Vet</p>
            </div>
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={`text-sm font-bold ${cfg.accent} shrink-0 mt-0.5`}>{i + 1}.</span>
                  <p className="text-[15px] text-calm-navy leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-warm-gray rounded-card p-4">
          <p className="text-xs text-medium-gray leading-relaxed text-center">
            This is general guidance only and is not a substitute for professional veterinary advice. When in doubt, always contact your vet.
          </p>
        </div>

        {/* Dog info footer */}
        {dogProfile && (
          <p className="text-[12px] text-medium-gray text-center pb-2">
            Assessment for {dogProfile.name} · {dogProfile.breed}
          </p>
        )}

      </div>

      {/* ── Sticky call vet footer ── */}
      {entry.recommendation === 'call_vet' && (
        <div className="fixed bottom-0 inset-x-0 max-w-md mx-auto px-4 pb-8 pt-3 bg-soft-cream border-t border-warm-gray">
          <button
            type="button"
            className="w-full min-h-[52px] rounded-button bg-call-vet-red text-white text-[15px] font-semibold flex items-center justify-center gap-2"
          >
            <Phone size={18} />
            {dogProfile?.vetClinicName ? `Call ${dogProfile.vetClinicName}` : 'Call Your Vet'}
          </button>
        </div>
      )}

    </div>
  )
}
