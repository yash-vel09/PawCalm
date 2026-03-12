'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  X, Phone, Eye, CheckCircle, Check, Stethoscope, Copy,
  Bookmark, BookmarkPlus, Share2, ThumbsUp, ThumbsDown,
} from 'lucide-react'
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

// ─── Recommendation config ──────────────────────────────────────────────────

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

// ─── Fallback recommendation derivation ───────────────────────────────────

function deriveRec(a: ConcernAssessmentInput): Recommendation {
  const urgentSymptoms = a.physicalSymptoms.some((s) => s === 'swelling' || s === 'shaking')
  const urgentConcern  = a.concernTypes.some((c) => c === 'limping' || c === 'aggression' || c === 'vomiting')
  const acuteOnset     = a.onsetTiming === 'within_the_hour' || a.onsetTiming === 'earlier_today'
  if ((a.worryLevel ?? 0) >= 4 || urgentSymptoms || (urgentConcern && acuteOnset)) return 'call_vet'
  const hasSymptoms = a.physicalSymptoms.some((s) => s !== 'none')
  if ((a.worryLevel ?? 0) >= 3 || hasSymptoms) return 'try_this'
  return 'monitor'
}

// ─── Framer Motion variants ────────────────────────────────────────────────

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const item = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router       = useRouter()
  const dogProfile   = useAppStore((s) => s.dogProfile)
  const assessment   = useAppStore((s) => s.currentAssessment)
  const result       = useAppStore((s) => s.assessmentResult)
  const addToHistory = useAppStore((s) => s.addToHistory)
  const dogName      = dogProfile?.name ?? 'Your dog'

  const [checkedActions, setCheckedActions] = useState<Set<number>>(new Set())
  const [feedback, setFeedback]             = useState<'up' | 'down' | null>(null)
  const [saved, setSaved]                   = useState(false)
  const [copied, setCopied]                 = useState(false)

  const rec = useMemo(() => {
    if (result) return result.recommendation
    if (assessment) return deriveRec(assessment)
    return 'monitor' as Recommendation
  }, [result, assessment])

  const cfg       = REC_CONFIG[rec]
  const actions   = result?.suggested_actions ?? []
  const questions = result?.questions_for_vet ?? []
  const showVetQs = (rec === 'try_this' || rec === 'call_vet') && questions.length > 0

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

  function toggleAction(i: number) {
    setCheckedActions((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  async function copyQuestions() {
    await navigator.clipboard.writeText(questions.join('\n\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleSave() {
    if (saved || !assessment) return
    addToHistory({
      id: Date.now().toString(),
      concernSummary: assessment.concernTypes.map((ct) => CONCERN_LABEL[ct]).join(', '),
      recommendation: rec,
      createdAt: new Date(),
    })
    setSaved(true)
  }

  async function handleShare() {
    const text = `PawCalm Assessment for ${dogName}\n\nRecommendation: ${cfg.label}\n\n${result?.reassurance_note ?? ''}\n\nSuggested actions:\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`
    if (typeof navigator.share !== 'undefined') {
      await navigator.share({ title: `${dogName}'s PawCalm Assessment`, text })
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-soft-cream">

      {/* ── Section 1: Colored header ── */}
      <div className={`relative border-l-4 ${cfg.borderL} ${cfg.heroBg} rounded-b-[24px] px-5 pt-14 pb-8`}>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="absolute top-12 left-4 p-2 rounded-full hover:bg-black/5 transition-colors"
          aria-label="Close"
        >
          <X size={22} className="text-calm-navy" />
        </button>

        <div className="flex justify-center mb-4">
          <span className={`${cfg.badge} text-white text-xs font-bold px-4 py-1.5 rounded-full`}>
            {cfg.label}
          </span>
        </div>

        <h2 className="text-[22px] font-bold text-calm-navy text-center mt-4">
          {cfg.headline}
        </h2>

        {result?.reassurance_note && (
          <p className="text-[15px] text-calm-navy/80 leading-relaxed text-center mt-2">
            {result.reassurance_note}
          </p>
        )}
      </div>

      {/* ── Scrollable sections ── */}
      <motion.div
        className={`flex-1 overflow-y-auto px-4 pt-5 space-y-4 ${rec === 'call_vet' ? 'pb-28' : 'pb-8'}`}
        variants={container}
        initial="hidden"
        animate="visible"
      >

        {/* Section 2: What might be going on */}
        {result && result.likely_explanations.length > 0 && (
          <motion.div variants={item} className="bg-white rounded-card p-4">
            <p className="text-xs font-bold text-medium-gray uppercase tracking-wide mb-4">What Might Be Going On</p>
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
          </motion.div>
        )}

        {/* Section 3: Keep an eye on */}
        {result && result.what_to_watch_for.length > 0 && (
          <motion.div variants={item} className="bg-white rounded-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Eye size={16} className={cfg.accent} />
              <p className="text-xs font-bold text-medium-gray uppercase tracking-wide">Keep an Eye On</p>
            </div>
            <div className="space-y-2.5">
              {result.what_to_watch_for.map((watch, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-[7px] ${cfg.dot}`} />
                  <p className="text-[15px] text-calm-navy leading-relaxed">{watch}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Section 4: What you can do (checklist) */}
        {actions.length > 0 && (
          <motion.div variants={item} className="bg-white rounded-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={16} className={cfg.accent} />
              <p className="text-xs font-bold text-medium-gray uppercase tracking-wide">What You Can Do</p>
            </div>
            <div className="space-y-1">
              {actions.map((action, i) => {
                const checked = checkedActions.has(i)
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleAction(i)}
                    className="flex items-start gap-3 w-full text-left py-2"
                  >
                    <div className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${checked ? 'bg-pawcalm-teal border-pawcalm-teal' : 'border-warm-gray'}`}>
                      {checked && <Check size={12} className="text-white" />}
                    </div>
                    <span className={`text-[15px] leading-relaxed ${checked ? 'line-through text-medium-gray' : 'text-calm-navy'}`}>
                      {action}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Section 5: Questions for your vet */}
        {showVetQs && (
          <motion.div variants={item} className="bg-white rounded-card p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Stethoscope size={16} className={cfg.accent} />
                <p className="text-xs font-bold text-medium-gray uppercase tracking-wide">Questions for Your Vet</p>
              </div>
              <button
                type="button"
                onClick={copyQuestions}
                className={`flex items-center gap-1.5 text-xs font-semibold ${cfg.accent} bg-warm-gray px-3 py-1.5 rounded-full transition-colors`}
              >
                <Copy size={12} />
                {copied ? 'Copied! ✓' : 'Copy all questions'}
              </button>
            </div>
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={`text-sm font-bold ${cfg.accent} shrink-0 mt-0.5`}>{i + 1}.</span>
                  <p className="text-[15px] text-calm-navy leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Section 6: Disclaimer */}
        <motion.div variants={item} className="bg-warm-gray rounded-card p-4">
          <p className="text-xs text-medium-gray leading-relaxed text-center">
            This is general guidance only and is not a substitute for professional veterinary advice. When in doubt, always contact your vet.
          </p>
        </motion.div>

        {/* Section 7: Feedback + Actions */}
        <motion.div variants={item} className="bg-white rounded-card p-4 space-y-4">
          {/* Did this help? */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-semibold text-calm-navy">Did this help?</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFeedback('up')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${feedback === 'up' ? 'bg-monitor-green border-monitor-green text-white' : 'border-warm-gray text-medium-gray'}`}
              >
                <ThumbsUp size={16} />
                Yes
              </button>
              <button
                type="button"
                onClick={() => setFeedback('down')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${feedback === 'down' ? 'bg-call-vet-red border-call-vet-red text-white' : 'border-warm-gray text-medium-gray'}`}
              >
                <ThumbsDown size={16} />
                No
              </button>
            </div>
          </div>

          {/* Save + Share buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              className={`flex-1 flex items-center justify-center gap-2 min-h-[44px] rounded-button border text-sm font-semibold transition-colors ${saved ? 'bg-pawcalm-teal border-pawcalm-teal text-white' : 'border-warm-gray text-calm-navy'}`}
            >
              {saved ? <Bookmark size={16} /> : <BookmarkPlus size={16} />}
              {saved ? 'Saved ✓' : 'Save to history'}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 min-h-[44px] rounded-button border border-warm-gray text-calm-navy text-sm font-semibold transition-colors"
            >
              <Share2 size={16} />
              Share with vet
            </button>
          </div>

          {/* Log another concern link */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => router.push('/concern')}
              className="text-sm font-medium text-pawcalm-teal"
            >
              Log another concern
            </button>
          </div>
        </motion.div>

      </motion.div>

      {/* ── Sticky footer (call_vet only) ── */}
      {rec === 'call_vet' && (
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
