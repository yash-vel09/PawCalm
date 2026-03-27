import type { PhysicalSymptom } from '@/store'
import OptionChip from '@/components/onboarding/OptionChip'

const DOG_SYMPTOMS: { label: string; value: PhysicalSymptom }[] = [
  { label: 'Excessive drooling', value: 'excessive_drooling' },
  { label: 'Shaking/trembling',  value: 'shaking' },
  { label: 'Coughing',           value: 'coughing' },
  { label: 'Sneezing',           value: 'sneezing' },
  { label: 'Eye discharge',      value: 'eye_discharge' },
  { label: 'Swelling',           value: 'swelling' },
  { label: 'Skin changes',       value: 'skin_changes' },
  { label: 'Bad breath',         value: 'bad_breath' },
  { label: 'Excessive thirst',   value: 'excessive_thirst' },
  { label: 'Weight change',      value: 'weight_change' },
  { label: 'None of these',      value: 'none' },
]

const CAT_SYMPTOMS: { label: string; value: PhysicalSymptom; redFlag?: boolean }[] = [
  { label: 'Diarrhea',                    value: 'diarrhea' },
  { label: 'Constipation',                value: 'constipation' },
  { label: 'Straining in litter box',     value: 'straining_litter_box', redFlag: true },
  { label: 'Blood in urine',              value: 'blood_in_urine',       redFlag: true },
  { label: 'Coughing',                    value: 'coughing' },
  { label: 'Sneezing',                    value: 'sneezing' },
  { label: 'Eye discharge',               value: 'eye_discharge' },
  { label: 'Watery eyes',                 value: 'watery_eyes' },
  { label: 'Skin changes / bald patches', value: 'bald_patches' },
  { label: 'Bad breath',                  value: 'bad_breath' },
  { label: 'Excessive thirst',            value: 'excessive_thirst' },
  { label: 'Weight change',               value: 'weight_change' },
  { label: 'Drooling (unusual)',           value: 'drooling' },
  { label: 'None of these',               value: 'none' },
]

interface Step3Props {
  values: PhysicalSymptom[]
  onChange: (v: PhysicalSymptom[]) => void
  petType: 'dog' | 'cat'
  symptomNotes: string
  onSymptomNotesChange: (v: string) => void
}

export default function Step3_PhysicalSymptoms({ values, onChange, petType, symptomNotes, onSymptomNotesChange }: Step3Props) {
  const SYMPTOMS = petType === 'cat' ? CAT_SYMPTOMS : DOG_SYMPTOMS

  const hasRedFlag = petType === 'cat' && values.some(
    (v) => CAT_SYMPTOMS.find((s) => s.value === v)?.redFlag
  )

  function toggle(val: PhysicalSymptom) {
    if (val === 'none') {
      onChange(['none'])
      return
    }
    const without = values.filter((v) => v !== 'none')
    if (without.includes(val)) {
      onChange(without.filter((v) => v !== val))
    } else {
      onChange([...without, val])
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-calm-navy mb-2">Any physical symptoms?</h2>
      <p className="text-sm text-medium-gray mb-6">Select all that apply</p>
      <div className="flex flex-wrap gap-2">
        {SYMPTOMS.map((s) => {
          const isRedFlag = 'redFlag' in s && s.redFlag
          return (
            <OptionChip
              key={s.value}
              label={isRedFlag ? `${s.label} ⚠️` : s.label}
              selected={values.includes(s.value)}
              onSelect={() => toggle(s.value)}
              className={isRedFlag ? 'border-call-vet-red/50 text-call-vet-red' : undefined}
            />
          )
        })}
      </div>
      {hasRedFlag && (
        <div className="mt-3 p-3 rounded-lg bg-soft-red-bg border border-call-vet-red/30 flex gap-2 items-start">
          <span className="text-call-vet-red text-sm font-semibold">⚠️</span>
          <p className="text-call-vet-red text-sm">
            This symptom can be urgent in cats — consider calling your vet soon.
          </p>
        </div>
      )}
      <div className="mt-4">
        <label className="block text-sm font-semibold text-calm-navy mb-1.5">
          Tell us more (optional)
        </label>
        <textarea
          value={symptomNotes}
          onChange={(e) => onSymptomNotesChange(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Describe what you're seeing..."
          className="w-full rounded-button border-2 border-warm-gray bg-white px-4 py-3 text-sm text-calm-navy placeholder:text-medium-gray focus:outline-none focus:border-pawcalm-teal resize-none"
        />
        <div className="flex justify-end mt-1">
          <span className="text-xs text-medium-gray">{symptomNotes.length}/500</span>
        </div>
      </div>
    </div>
  )
}
