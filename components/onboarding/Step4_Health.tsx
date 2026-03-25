import { DogProfileDraft, HealthCondition } from '@/store'
import OptionChip from './OptionChip'

interface Step4Props {
  draft: DogProfileDraft
  onChange: (updates: Partial<DogProfileDraft>) => void
  petType: 'dog' | 'cat'
}

const DOG_HEALTH_OPTIONS: { label: string; value: HealthCondition }[] = [
  { label: 'Allergies', value: 'allergies' },
  { label: 'Joint issues', value: 'joint_issues' },
  { label: 'Heart condition', value: 'heart_condition' },
  { label: 'Diabetes', value: 'diabetes' },
  { label: 'Seizures', value: 'seizures' },
  { label: 'Other', value: 'other' },
  { label: 'None', value: 'none' },
]

const CAT_HEALTH_OPTIONS: { label: string; value: HealthCondition }[] = [
  { label: 'Urinary/Kidney issues', value: 'urinary_kidney' },
  { label: 'Allergies', value: 'allergies' },
  { label: 'Dental disease', value: 'dental_disease' },
  { label: 'Thyroid issues', value: 'thyroid_issues' },
  { label: 'Diabetes', value: 'diabetes' },
  { label: 'Heart condition', value: 'heart_condition' },
  { label: 'Asthma', value: 'asthma' },
  { label: 'Other', value: 'other' },
  { label: 'None', value: 'none' },
]

export default function Step4_Health({ draft, onChange, petType }: Step4Props) {
  const HEALTH_OPTIONS = petType === 'cat' ? CAT_HEALTH_OPTIONS : DOG_HEALTH_OPTIONS
  const selected = draft.healthConditions ?? []

  function toggleCondition(value: HealthCondition) {
    if (value === 'none') {
      onChange({ healthConditions: ['none'] })
    } else {
      const without = selected.filter((c) => c !== 'none')
      if (without.includes(value)) {
        onChange({ healthConditions: without.filter((c) => c !== value) })
      } else {
        onChange({ healthConditions: [...without, value] })
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 px-6 pt-4 pb-8">
      <div>
        <h2 className="text-2xl font-bold text-calm-navy">Health & medications</h2>
        <p className="text-medium-gray text-sm mt-1">You can skip this — update it anytime in settings</p>
      </div>

      {/* Health conditions */}
      <div>
        <label className="block text-sm font-semibold text-calm-navy mb-2">
          Known health conditions
        </label>
        <div className="flex flex-wrap gap-2">
          {HEALTH_OPTIONS.map((opt) => (
            <OptionChip
              key={opt.value}
              label={opt.label}
              selected={selected.includes(opt.value)}
              onSelect={() => toggleCondition(opt.value)}
            />
          ))}
        </div>
      </div>

      {/* Medications */}
      <div>
        <label className="block text-sm font-semibold text-calm-navy mb-1.5">
          Current medications <span className="text-medium-gray font-normal">(optional)</span>
        </label>
        <textarea
          value={draft.medications ?? ''}
          onChange={(e) => onChange({ medications: e.target.value })}
          placeholder="e.g. Monthly heartworm preventative"
          rows={3}
          className="w-full border-2 border-warm-gray rounded-button px-4 py-2.5 text-sm text-calm-navy placeholder-medium-gray focus:outline-none focus:border-pawcalm-teal resize-none"
        />
      </div>

      {/* Vet clinic */}
      <div>
        <label className="block text-sm font-semibold text-calm-navy mb-1.5">
          Vet clinic name <span className="text-medium-gray font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={draft.vetClinicName ?? ''}
          onChange={(e) => onChange({ vetClinicName: e.target.value })}
          placeholder="e.g. Happy Paws Veterinary"
          className="w-full border-2 border-warm-gray rounded-button px-4 py-2.5 text-sm text-calm-navy placeholder-medium-gray focus:outline-none focus:border-pawcalm-teal"
        />
      </div>
    </div>
  )
}
