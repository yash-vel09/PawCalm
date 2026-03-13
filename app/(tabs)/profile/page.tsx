'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Camera, Pencil, PawPrint } from 'lucide-react'
import { useAppStore } from '@/store'
import { useToast } from '@/lib/toast'
import type {
  DogProfile, DogSex, SpayedNeuteredStatus,
  EatingPattern, EnergyPattern, MoodPattern,
  HealthCondition, Recommendation,
} from '@/store'
import OptionChip from '@/components/onboarding/OptionChip'
import ToggleButton from '@/components/onboarding/ToggleButton'
import SearchableBreedSelect from '@/components/onboarding/SearchableBreedSelect'
import { formatRelativeTime } from '@/lib/formatTime'

// ─── Label maps ────────────────────────────────────────────────────────────

const SEX_LABEL: Record<DogSex, string> = { male: 'Male', female: 'Female' }
const SPAYED_LABEL: Record<SpayedNeuteredStatus, string> = { yes: 'Yes', no: 'No', not_sure: 'Not sure' }
const EATING_LABEL: Record<EatingPattern, string> = { eats_everything: 'Eats everything', moderate_eater: 'Moderate eater', picky_eater: 'Picky eater', variable: 'Variable' }
const ENERGY_LABEL: Record<EnergyPattern, string> = { very_active: 'Very active', moderately_active: 'Moderately active', calm: 'Calm', low_energy: 'Low energy' }
const MOOD_LABEL: Record<MoodPattern, string> = { very_social: 'Very social', friendly: 'Friendly', independent: 'Independent', anxious: 'Anxious' }
const HEALTH_LABEL: Record<HealthCondition, string> = { allergies: 'Allergies', joint_issues: 'Joint issues', heart_condition: 'Heart condition', diabetes: 'Diabetes', seizures: 'Seizures', none: 'None', other: 'Other' }
const REC_LABEL: Record<Recommendation, string> = { monitor: '🟢 Monitor', try_this: '🟡 Try This', call_vet: '🔴 Call Vet' }

// ─── Edit option arrays (mirrors onboarding steps) ────────────────────────

const SEX_OPTIONS     = [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]
const SPAYED_OPTIONS  = [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }, { label: 'Not sure', value: 'not_sure' }]
const EATING_OPTIONS  = [{ label: 'Eats everything', value: 'eats_everything' }, { label: 'Moderate eater', value: 'moderate_eater' }, { label: 'Picky eater', value: 'picky_eater' }, { label: 'Variable', value: 'variable' }]
const ENERGY_OPTIONS  = [{ label: 'Very active', value: 'very_active' }, { label: 'Moderately active', value: 'moderately_active' }, { label: 'Calm', value: 'calm' }, { label: 'Low energy', value: 'low_energy' }]
const MOOD_OPTIONS    = [{ label: 'Very social', value: 'very_social' }, { label: 'Friendly', value: 'friendly' }, { label: 'Independent', value: 'independent' }, { label: 'Anxious', value: 'anxious' }]
const HEALTH_OPTIONS  = [{ label: 'Allergies', value: 'allergies' }, { label: 'Joint issues', value: 'joint_issues' }, { label: 'Heart condition', value: 'heart_condition' }, { label: 'Diabetes', value: 'diabetes' }, { label: 'Seizures', value: 'seizures' }, { label: 'Other', value: 'other' }, { label: 'None', value: 'none' }]

// ─── Shared input class ────────────────────────────────────────────────────

const INPUT = 'w-full border-2 border-warm-gray rounded-button px-4 py-2.5 text-sm text-calm-navy placeholder-medium-gray focus:outline-none focus:border-pawcalm-teal transition-colors'

// ─── Helper components ─────────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-warm-gray last:border-0">
      <span className="text-[13px] text-medium-gray mt-0.5 shrink-0 mr-4">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  )
}

function InfoValue({ children }: { children: React.ReactNode }) {
  return <span className="text-[15px] text-calm-navy font-medium">{children}</span>
}

function CardHeader({
  title, onEdit,
}: { title: string; onEdit?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-bold text-medium-gray uppercase tracking-wide">{title}</p>
      {onEdit && (
        <button type="button" onClick={onEdit} className="p-1 -mr-1" aria-label={`Edit ${title}`}>
          <Pencil size={15} className="text-medium-gray" />
        </button>
      )}
    </div>
  )
}

function EditActions({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  return (
    <div className="flex gap-2.5 mt-5">
      <button type="button" onClick={onCancel} className="flex-1 py-2.5 border-2 border-warm-gray rounded-button text-sm font-semibold text-medium-gray">
        Cancel
      </button>
      <button type="button" onClick={onSave} className="flex-1 py-2.5 bg-pawcalm-teal rounded-button text-sm font-semibold text-white">
        Save changes
      </button>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

type EditCard = 'basic' | 'patterns' | 'health'

export default function ProfilePage() {
  const dogProfile    = useAppStore((s) => s.dogProfile)
  const setDogProfile = useAppStore((s) => s.setDogProfile)
  const history       = useAppStore((s) => s.assessmentHistory)

  const [editing, setEditing] = useState<EditCard | null>(null)
  const [draft, setDraft]     = useState<DogProfile | null>(null)
  const { show } = useToast()

  // ── Statistics ──
  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [history],
  )
  const lastEntry = sortedHistory[0] ?? null
  const mostCommonRec = useMemo(() => {
    if (!history.length) return null
    const counts = history.reduce((acc, e) => {
      acc[e.recommendation] = (acc[e.recommendation] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as Recommendation | undefined
  }, [history])

  // ── Edit helpers ──
  function startEdit(card: EditCard) {
    if (!dogProfile) return
    setDraft({ ...dogProfile })
    setEditing(card)
  }

  function saveEdit() {
    if (draft) setDogProfile(draft)
    setEditing(null)
    setDraft(null)
    show('Profile updated', 'success')
  }

  function cancelEdit() {
    setEditing(null)
    setDraft(null)
  }

  function patchDraft(updates: Partial<DogProfile>) {
    setDraft((prev) => prev ? { ...prev, ...updates } : prev)
  }

  function toggleHealthCondition(value: HealthCondition) {
    setDraft((prev) => {
      if (!prev) return prev
      if (value === 'none') return { ...prev, healthConditions: ['none'] }
      const without = prev.healthConditions.filter((c) => c !== 'none')
      if (without.includes(value)) return { ...prev, healthConditions: without.filter((c) => c !== value) }
      return { ...prev, healthConditions: [...without, value] }
    })
  }

  function handlePhotoTap() {
    show('Photo upload coming soon')
  }

  // ── Empty state ──
  if (!dogProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-warm-gray flex items-center justify-center mb-5">
          <PawPrint size={32} className="text-medium-gray" />
        </div>
        <h2 className="text-[18px] font-semibold text-calm-navy mb-2">No dog profile yet</h2>
        <p className="text-[15px] text-medium-gray leading-relaxed mb-6 max-w-xs">
          Complete your dog&apos;s profile to get personalized assessments.
        </p>
        <Link
          href="/onboarding"
          className="bg-pawcalm-teal text-white text-[15px] font-semibold px-6 py-3 rounded-button"
        >
          Set up profile
        </Link>
      </div>
    )
  }

  const ageDisplay = dogProfile.isPuppy
    ? 'Puppy (< 1 yr)'
    : dogProfile.ageYears
    ? `${dogProfile.ageYears} yr${dogProfile.ageYears === 1 ? '' : 's'}`
    : '—'

  const memberSince = new Date('2025-10-15').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const activeConditions = dogProfile.healthConditions.filter((c) => c !== 'none')

  return (
    <div className="flex flex-col bg-soft-cream min-h-[calc(100vh-64px)]">
      <div className="overflow-y-auto px-4 pt-10 pb-10 space-y-4">

        {/* ── Profile header ── */}
        <div className="flex flex-col items-center pt-2 pb-2">
          {/* Photo */}
          <button type="button" onClick={handlePhotoTap} className="relative mb-4" aria-label="Edit photo">
            <div className="w-[120px] h-[120px] rounded-full bg-light-teal flex items-center justify-center overflow-hidden">
              {dogProfile.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={dogProfile.photoUrl} alt={dogProfile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[48px] font-bold text-pawcalm-teal leading-none">
                  {dogProfile.name[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="absolute bottom-1 right-1 w-8 h-8 bg-pawcalm-teal rounded-full flex items-center justify-center border-2 border-soft-cream shadow-sm">
              <Camera size={14} className="text-white" />
            </div>
          </button>

          <h1 className="text-[28px] font-bold text-calm-navy">{dogProfile.name}</h1>
          <p className="text-[15px] text-medium-gray mt-1">
            {dogProfile.breed} · {ageDisplay} · {dogProfile.weightLbs} lbs
          </p>
          <p className="text-[13px] text-medium-gray mt-1">Member since {memberSince}</p>
        </div>

        {/* ── Basic Info card ── */}
        <div className="bg-white rounded-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <CardHeader
            title="Basic Info"
            onEdit={editing === null ? () => startEdit('basic') : undefined}
          />
          {editing === 'basic' && draft ? (
            <>
              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-calm-navy mb-1.5">Name</label>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => patchDraft({ name: e.target.value })}
                  className={INPUT}
                />
              </div>

              {/* Breed */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-calm-navy mb-1.5">Breed</label>
                <SearchableBreedSelect
                  value={draft.breed}
                  onChange={(breed) => patchDraft({ breed })}
                />
              </div>

              {/* Age */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-calm-navy mb-1.5">Age</label>
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.isPuppy}
                    onChange={(e) => patchDraft({ isPuppy: e.target.checked, ageYears: null })}
                    className="w-4 h-4 accent-pawcalm-teal"
                  />
                  <span className="text-sm text-calm-navy">Under 1 year old (puppy)</span>
                </label>
                {!draft.isPuppy && (
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={draft.ageYears ?? ''}
                    onChange={(e) => patchDraft({ ageYears: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Age in years"
                    className={INPUT}
                  />
                )}
              </div>

              {/* Weight */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-calm-navy mb-1.5">Weight (lbs)</label>
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={draft.weightLbs || ''}
                  onChange={(e) => patchDraft({ weightLbs: e.target.value ? Number(e.target.value) : 0 })}
                  placeholder="e.g. 45"
                  className={INPUT}
                />
              </div>

              {/* Sex */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-calm-navy mb-1.5">Sex</label>
                <ToggleButton
                  options={SEX_OPTIONS}
                  value={draft.sex}
                  onChange={(v) => patchDraft({ sex: v as DogSex })}
                />
              </div>

              {/* Spayed/Neutered */}
              <div className="mb-1">
                <label className="block text-sm font-semibold text-calm-navy mb-1.5">Spayed / Neutered</label>
                <ToggleButton
                  options={SPAYED_OPTIONS}
                  value={draft.spayedNeutered}
                  onChange={(v) => patchDraft({ spayedNeutered: v as SpayedNeuteredStatus })}
                />
              </div>

              <EditActions onSave={saveEdit} onCancel={cancelEdit} />
            </>
          ) : (
            <>
              <InfoRow label="Name"><InfoValue>{dogProfile.name}</InfoValue></InfoRow>
              <InfoRow label="Breed"><InfoValue>{dogProfile.breed}</InfoValue></InfoRow>
              <InfoRow label="Age"><InfoValue>{ageDisplay}</InfoValue></InfoRow>
              <InfoRow label="Weight"><InfoValue>{dogProfile.weightLbs} lbs</InfoValue></InfoRow>
              <InfoRow label="Sex"><InfoValue>{SEX_LABEL[dogProfile.sex]}</InfoValue></InfoRow>
              <InfoRow label="Spayed / Neutered"><InfoValue>{SPAYED_LABEL[dogProfile.spayedNeutered]}</InfoValue></InfoRow>
            </>
          )}
        </div>

        {/* ── Normal Patterns card ── */}
        <div className="bg-white rounded-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <CardHeader
            title="Normal Patterns"
            onEdit={editing === null ? () => startEdit('patterns') : undefined}
          />
          {editing === 'patterns' && draft ? (
            <>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-calm-navy mb-2">Eating habits</label>
                <div className="flex flex-wrap gap-2">
                  {EATING_OPTIONS.map((opt) => (
                    <OptionChip
                      key={opt.value}
                      label={opt.label}
                      selected={draft.normalEating === opt.value}
                      onSelect={() => patchDraft({ normalEating: opt.value as EatingPattern })}
                    />
                  ))}
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-calm-navy mb-2">Energy level</label>
                <div className="flex flex-wrap gap-2">
                  {ENERGY_OPTIONS.map((opt) => (
                    <OptionChip
                      key={opt.value}
                      label={opt.label}
                      selected={draft.normalEnergy === opt.value}
                      onSelect={() => patchDraft({ normalEnergy: opt.value as EnergyPattern })}
                    />
                  ))}
                </div>
              </div>
              <div className="mb-1">
                <label className="block text-sm font-semibold text-calm-navy mb-2">Usual mood</label>
                <div className="flex flex-wrap gap-2">
                  {MOOD_OPTIONS.map((opt) => (
                    <OptionChip
                      key={opt.value}
                      label={opt.label}
                      selected={draft.normalMood === opt.value}
                      onSelect={() => patchDraft({ normalMood: opt.value as MoodPattern })}
                    />
                  ))}
                </div>
              </div>
              <EditActions onSave={saveEdit} onCancel={cancelEdit} />
            </>
          ) : (
            <>
              <InfoRow label="Eating"><InfoValue>{EATING_LABEL[dogProfile.normalEating]}</InfoValue></InfoRow>
              <InfoRow label="Energy"><InfoValue>{ENERGY_LABEL[dogProfile.normalEnergy]}</InfoValue></InfoRow>
              <InfoRow label="Mood"><InfoValue>{MOOD_LABEL[dogProfile.normalMood]}</InfoValue></InfoRow>
            </>
          )}
        </div>

        {/* ── Health Background card ── */}
        <div className="bg-white rounded-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <CardHeader
            title="Health Background"
            onEdit={editing === null ? () => startEdit('health') : undefined}
          />
          {editing === 'health' && draft ? (
            <>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-calm-navy mb-2">Known health conditions</label>
                <div className="flex flex-wrap gap-2">
                  {HEALTH_OPTIONS.map((opt) => (
                    <OptionChip
                      key={opt.value}
                      label={opt.label}
                      selected={draft.healthConditions.includes(opt.value as HealthCondition)}
                      onSelect={() => toggleHealthCondition(opt.value as HealthCondition)}
                    />
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-calm-navy mb-1.5">Current medications</label>
                <textarea
                  value={draft.medications}
                  onChange={(e) => patchDraft({ medications: e.target.value })}
                  placeholder="List any current medications..."
                  rows={3}
                  className="w-full border-2 border-warm-gray rounded-button px-4 py-2.5 text-sm text-calm-navy placeholder-medium-gray focus:outline-none focus:border-pawcalm-teal transition-colors resize-none"
                />
              </div>
              <div className="mb-1">
                <label className="block text-sm font-semibold text-calm-navy mb-1.5">Vet clinic name</label>
                <input
                  type="text"
                  value={draft.vetClinicName}
                  onChange={(e) => patchDraft({ vetClinicName: e.target.value })}
                  placeholder="e.g. Happy Paws Veterinary"
                  className={INPUT}
                />
              </div>
              <EditActions onSave={saveEdit} onCancel={cancelEdit} />
            </>
          ) : (
            <>
              <InfoRow label="Conditions">
                {activeConditions.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {activeConditions.map((c) => (
                      <span key={c} className="bg-warm-gray text-calm-navy text-xs font-semibold px-2.5 py-1 rounded-full">
                        {HEALTH_LABEL[c]}
                      </span>
                    ))}
                  </div>
                ) : (
                  <InfoValue>None</InfoValue>
                )}
              </InfoRow>
              <InfoRow label="Medications">
                <InfoValue>{dogProfile.medications || '—'}</InfoValue>
              </InfoRow>
              <InfoRow label="Vet clinic">
                <InfoValue>{dogProfile.vetClinicName || '—'}</InfoValue>
              </InfoRow>
            </>
          )}
        </div>

        {/* ── Statistics card ── */}
        <div className="bg-light-teal rounded-card p-4">
          <p className="text-xs font-bold text-pawcalm-teal uppercase tracking-wide mb-3">Statistics</p>
          <div className="space-y-0">
            <div className="flex items-center justify-between py-2.5 border-b border-pawcalm-teal/10 last:border-0">
              <span className="text-[13px] text-calm-navy/70">Total assessments</span>
              <span className="text-[15px] font-bold text-pawcalm-teal">{history.length}</span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-pawcalm-teal/10 last:border-0">
              <span className="text-[13px] text-calm-navy/70">Most frequent outcome</span>
              <span className="text-[15px] font-semibold text-calm-navy">
                {mostCommonRec ? REC_LABEL[mostCommonRec] : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5 last:border-0">
              <span className="text-[13px] text-calm-navy/70">Last assessment</span>
              <span className="text-[15px] font-semibold text-calm-navy">
                {lastEntry ? formatRelativeTime(lastEntry.createdAt) : '—'}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
