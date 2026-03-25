import { useState } from 'react'
import { DogProfileDraft } from '@/store'
import { BREEDS, CAT_BREEDS } from '@/lib/breeds'
import SearchableBreedSelect from './SearchableBreedSelect'
import ToggleButton from './ToggleButton'

interface Step2Props {
  draft: DogProfileDraft
  onChange: (updates: Partial<DogProfileDraft>) => void
  errors: Record<string, string>
  petType: 'dog' | 'cat'
}

const SEX_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
]

const SPAYED_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
  { label: 'Not sure', value: 'not_sure' },
]

const INDOOR_OUTDOOR_OPTIONS = [
  { label: 'Indoor only', value: 'indoor' },
  { label: 'Outdoor only', value: 'outdoor' },
  { label: 'Both', value: 'both' },
]

export default function Step2_Details({ draft, onChange, errors, petType }: Step2Props) {
  const dogName = draft.name || 'your dog'
  const [ageMsg, setAgeMsg] = useState('')
  const [weightMsg, setWeightMsg] = useState('')

  return (
    <div className="flex flex-col gap-5 px-6 pt-4 pb-8">
      <div>
        <h2 className="text-2xl font-bold text-calm-navy">Tell us about {dogName}</h2>
        <p className="text-medium-gray text-sm mt-1">We use this to personalize assessments</p>
      </div>

      {/* Breed */}
      <div>
        <label className="block text-sm font-semibold text-calm-navy mb-1.5">
          Breed <span className="text-call-vet-red">*</span>
        </label>
        <SearchableBreedSelect
          value={draft.breed ?? ''}
          onChange={(breed) => onChange({ breed })}
          breeds={petType === 'cat' ? CAT_BREEDS : BREEDS}
        />
        {errors.breed && <p className="text-call-vet-red text-xs mt-1">{errors.breed}</p>}
      </div>

      {/* Age */}
      <div>
        <label className="block text-sm font-semibold text-calm-navy mb-1.5">
          Age <span className="text-call-vet-red">*</span>
        </label>
        <label className="flex items-center gap-2 mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={draft.isPuppy ?? false}
            onChange={(e) => onChange({ isPuppy: e.target.checked, ageYears: null })}
            className="w-4 h-4 accent-pawcalm-teal"
          />
          <span className="text-sm text-calm-navy">
            {petType === 'cat' ? 'Under 1 year old (kitten)' : 'Under 1 year old (puppy)'}
          </span>
        </label>
        {!draft.isPuppy && (
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={30}
            value={draft.ageYears ?? ''}
            onChange={(e) => { onChange({ ageYears: e.target.value ? Number(e.target.value) : null }); setAgeMsg('') }}
            onBlur={(e) => {
              if (!e.target.value) { setAgeMsg(''); return }
              const v = Number(e.target.value)
              if (v > 30) { onChange({ ageYears: 30 }); setAgeMsg('Age must be between 0 and 30 years') }
              else if (v < 0) { onChange({ ageYears: 0 }); setAgeMsg('Age must be between 0 and 30 years') }
              else setAgeMsg('')
            }}
            onKeyDown={(e) => {
              if (!['Backspace','Delete','Tab','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key) && !/^\d$/.test(e.key)) {
                e.preventDefault()
              }
            }}
            placeholder="e.g. 4"
            className={`w-full border-2 rounded-button px-4 py-2.5 text-sm text-calm-navy placeholder-medium-gray focus:outline-none transition-colors ${
              errors.ageYears || ageMsg ? 'border-call-vet-red' : 'border-warm-gray focus:border-pawcalm-teal'
            }`}
          />
        )}
        {(errors.ageYears || ageMsg) && <p className="text-call-vet-red text-xs mt-1">{errors.ageYears || ageMsg}</p>}
      </div>

      {/* Weight */}
      <div>
        <label className="block text-sm font-semibold text-calm-navy mb-1.5">
          Weight (lbs) <span className="text-call-vet-red">*</span>
        </label>
        <input
          type="number"
          inputMode="decimal"
          min={1}
          max={300}
          value={draft.weightLbs ?? ''}
          onChange={(e) => { onChange({ weightLbs: e.target.value ? Number(e.target.value) : undefined }); setWeightMsg('') }}
          onBlur={(e) => {
            if (!e.target.value) { setWeightMsg(''); return }
            const v = Number(e.target.value)
            if (v > 300) { onChange({ weightLbs: 300 }); setWeightMsg('Weight must be between 1 and 300 lbs') }
            else if (v < 1) { onChange({ weightLbs: 1 }); setWeightMsg('Weight must be between 1 and 300 lbs') }
            else setWeightMsg('')
          }}
          onKeyDown={(e) => {
            if (!['Backspace','Delete','Tab','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','.'].includes(e.key) && !/^\d$/.test(e.key)) {
              e.preventDefault()
            }
          }}
          placeholder="65"
          className={`w-full border-2 rounded-button px-4 py-2.5 text-sm text-calm-navy placeholder-medium-gray focus:outline-none transition-colors ${
            errors.weightLbs || weightMsg ? 'border-call-vet-red' : 'border-warm-gray focus:border-pawcalm-teal'
          }`}
        />
        {(errors.weightLbs || weightMsg) && <p className="text-call-vet-red text-xs mt-1">{errors.weightLbs || weightMsg}</p>}
      </div>

      {/* Sex */}
      <div>
        <label className="block text-sm font-semibold text-calm-navy mb-1.5">
          Sex <span className="text-call-vet-red">*</span>
        </label>
        <ToggleButton
          options={SEX_OPTIONS}
          value={draft.sex ?? null}
          onChange={(v) => onChange({ sex: v as 'male' | 'female' })}
        />
        {errors.sex && <p className="text-call-vet-red text-xs mt-1">{errors.sex}</p>}
      </div>

      {/* Spayed/Neutered */}
      <div>
        <label className="block text-sm font-semibold text-calm-navy mb-1.5">
          Spayed / Neutered <span className="text-call-vet-red">*</span>
        </label>
        <ToggleButton
          options={SPAYED_OPTIONS}
          value={draft.spayedNeutered ?? null}
          onChange={(v) => onChange({ spayedNeutered: v as 'yes' | 'no' | 'not_sure' })}
        />
        {errors.spayedNeutered && (
          <p className="text-call-vet-red text-xs mt-1">{errors.spayedNeutered}</p>
        )}
      </div>

      {/* Cat-only: Living situation */}
      {petType === 'cat' && (
        <div>
          <label className="block text-sm font-semibold text-calm-navy mb-1.5">
            Living situation <span className="text-call-vet-red">*</span>
          </label>
          <ToggleButton
            options={INDOOR_OUTDOOR_OPTIONS}
            value={draft.indoorOutdoor ?? null}
            onChange={(v) => onChange({ indoorOutdoor: v as 'indoor' | 'outdoor' | 'both' })}
          />
          {errors.indoorOutdoor && (
            <p className="text-call-vet-red text-xs mt-1">{errors.indoorOutdoor}</p>
          )}
        </div>
      )}
    </div>
  )
}
