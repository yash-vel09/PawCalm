import type { RecentChange } from '@/store'
import OptionChip from '@/components/onboarding/OptionChip'

const CHANGES: { label: string; value: RecentChange }[] = [
  { label: 'New food or treats',     value: 'new_food' },
  { label: 'Moved to new home',      value: 'moved_home' },
  { label: 'New pet in household',   value: 'new_pet' },
  { label: 'New baby/family member', value: 'new_family_member' },
  { label: 'Change in schedule',     value: 'schedule_change' },
  { label: 'Recent boarding/travel', value: 'boarding_travel' },
  { label: 'Weather change',         value: 'weather_change' },
  { label: 'New medication',         value: 'new_medication' },
  { label: 'Recent vet visit',       value: 'vet_visit' },
  { label: 'Loss of companion',      value: 'loss_of_companion' },
  { label: 'Nothing has changed',    value: 'nothing_changed' },
]

interface Step4Props {
  values: RecentChange[]
  onChange: (v: RecentChange[]) => void
  recentChangesNotes: string
  onRecentChangesNotesChange: (v: string) => void
}

export default function Step4_RecentChanges({ values, onChange, recentChangesNotes, onRecentChangesNotesChange }: Step4Props) {
  function toggle(val: RecentChange) {
    if (val === 'nothing_changed') {
      onChange(['nothing_changed'])
      return
    }
    const without = values.filter((v) => v !== 'nothing_changed')
    if (without.includes(val)) {
      onChange(without.filter((v) => v !== val))
    } else {
      onChange([...without, val])
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-calm-navy mb-2">Has anything changed recently?</h2>
      <p className="text-sm text-medium-gray mb-6">Select all that apply</p>
      <div className="flex flex-wrap gap-2">
        {CHANGES.map((c) => (
          <OptionChip
            key={c.value}
            label={c.label}
            selected={values.includes(c.value)}
            onSelect={() => toggle(c.value)}
          />
        ))}
      </div>
      <div className="mt-4">
        <label className="block text-sm font-semibold text-calm-navy mb-1.5">
          Tell us more (optional)
        </label>
        <textarea
          value={recentChangesNotes}
          onChange={(e) => onRecentChangesNotesChange(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Any other details about recent changes..."
          className="w-full rounded-button border-2 border-warm-gray bg-white px-4 py-3 text-sm text-calm-navy placeholder:text-medium-gray focus:outline-none focus:border-pawcalm-teal resize-none"
        />
        <div className="flex justify-end mt-1">
          <span className="text-xs text-medium-gray">{recentChangesNotes.length}/500</span>
        </div>
      </div>
    </div>
  )
}
