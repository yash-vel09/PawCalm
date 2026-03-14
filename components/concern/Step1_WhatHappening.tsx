import type { ConcernAssessmentInput, ConcernType } from '@/store'
import ConcernTypeCard from './ConcernTypeCard'

const DOG_CONCERNS: { emoji: string; label: string; value: ConcernType }[] = [
  { emoji: '🍽️', label: 'Not eating / eating less',     value: 'not_eating' },
  { emoji: '😴', label: 'Low energy / lethargy',         value: 'low_energy' },
  { emoji: '🤢', label: 'Vomiting / upset stomach',      value: 'vomiting' },
  { emoji: '💩', label: 'Bathroom issues',               value: 'bathroom_issues' },
  { emoji: '🐕', label: 'Unusual barking / whining',     value: 'unusual_barking' },
  { emoji: '😠', label: 'Aggression / behavior change',  value: 'aggression' },
  { emoji: '🦴', label: 'Limping / mobility issues',     value: 'limping' },
  { emoji: '🔍', label: 'Something else',                value: 'something_else' },
]

const CAT_CONCERNS: { emoji: string; label: string; value: ConcernType }[] = [
  { emoji: '🍽️', label: 'Not eating / eating less',        value: 'not_eating' },
  { emoji: '😴', label: 'Low energy / lethargy',            value: 'low_energy' },
  { emoji: '🤢', label: 'Vomiting / hairballs',             value: 'vomiting' },
  { emoji: '🚽', label: 'Litter box changes',               value: 'litter_box_changes' },
  { emoji: '🙀', label: 'Hiding more than usual',           value: 'hiding' },
  { emoji: '😠', label: 'Aggression / behavior change',     value: 'aggression' },
  { emoji: '💈', label: 'Excessive grooming / fur loss',    value: 'excessive_grooming' },
  { emoji: '😿', label: 'Excessive meowing / vocalization', value: 'excessive_meowing' },
  { emoji: '🔍', label: 'Something else',                   value: 'something_else' },
]

interface Step1Props {
  draft: Partial<ConcernAssessmentInput>
  onChange: (u: Partial<ConcernAssessmentInput>) => void
  errors: Record<string, string>
  petName: string
  petType: 'dog' | 'cat'
}

export default function Step1_WhatHappening({ draft, onChange, errors, petName, petType }: Step1Props) {
  const concernTypes = draft.concernTypes ?? []
  const additionalNotes = draft.additionalNotes ?? ''
  const somethingElseSelected = concernTypes.includes('something_else')

  const CONCERN_OPTIONS = petType === 'cat' ? CAT_CONCERNS : DOG_CONCERNS

  function toggleConcern(value: ConcernType) {
    if (concernTypes.includes(value)) {
      onChange({ concernTypes: concernTypes.filter((c) => c !== value) })
    } else if (concernTypes.length < 3) {
      onChange({ concernTypes: [...concernTypes, value] })
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-calm-navy mb-2">
        What&apos;s going on with {petName}?
      </h2>
      <p className="text-sm text-medium-gray mb-6">Select up to 3</p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {CONCERN_OPTIONS.map((opt) => {
          const selected = concernTypes.includes(opt.value)
          const disabled = !selected && concernTypes.length >= 3
          return (
            <ConcernTypeCard
              key={opt.value}
              emoji={opt.emoji}
              label={opt.label}
              selected={selected}
              onSelect={() => toggleConcern(opt.value)}
              disabled={disabled}
            />
          )
        })}
      </div>
      {errors.concernTypes && (
        <p className="text-sm text-call-vet-red mb-3">{errors.concernTypes}</p>
      )}
      <div className="mt-2">
        <label className="block text-sm font-semibold text-calm-navy mb-1.5">
          {somethingElseSelected ? 'What specifically is happening? *' : 'Tell us more (optional)'}
        </label>
        <textarea
          value={additionalNotes}
          onChange={(e) => onChange({ additionalNotes: e.target.value })}
          maxLength={500}
          rows={3}
          placeholder={somethingElseSelected ? 'Describe what you\'ve noticed...' : 'Any additional context...'}
          className="w-full rounded-button border-2 border-warm-gray bg-white px-4 py-3 text-sm text-calm-navy placeholder:text-medium-gray focus:outline-none focus:border-pawcalm-teal resize-none"
        />
        <div className="flex justify-between mt-1">
          {errors.additionalNotes
            ? <p className="text-sm text-call-vet-red">{errors.additionalNotes}</p>
            : <span />
          }
          <span className="text-xs text-medium-gray">{additionalNotes.length}/500</span>
        </div>
      </div>
    </div>
  )
}
