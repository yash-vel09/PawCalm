import { create } from 'zustand'
import { MOCK_HISTORY } from '@/lib/mockHistory'
import { MOCK_DOG_PROFILE } from '@/lib/mockDogProfile'
import { MOCK_CAT_PROFILE } from '@/lib/mockCatProfile'

export type ConcernType =
  | 'not_eating' | 'low_energy' | 'vomiting' | 'bathroom_issues'
  | 'unusual_barking' | 'aggression' | 'limping' | 'something_else'
  // cat-specific:
  | 'litter_box_changes' | 'hiding' | 'excessive_grooming' | 'excessive_meowing'
  | 'hairballs'
export type OnsetTiming = 'within_the_hour' | 'earlier_today' | 'yesterday' | 'few_days' | 'week_or_more'
export type PhysicalSymptom =
  | 'excessive_drooling' | 'shaking' | 'coughing' | 'sneezing'
  | 'eye_discharge' | 'swelling' | 'skin_changes' | 'bad_breath'
  | 'excessive_thirst' | 'weight_change' | 'none'
  // cat-specific:
  | 'diarrhea' | 'constipation' | 'straining_litter_box' | 'blood_in_urine'
  | 'watery_eyes' | 'bald_patches' | 'drooling'
export type RecentChange = 'new_food' | 'moved_home' | 'new_pet' | 'new_family_member' | 'schedule_change' | 'boarding_travel' | 'weather_change' | 'new_medication' | 'vet_visit' | 'loss_of_companion' | 'nothing_changed'

export interface ConcernAssessmentInput {
  petType: 'dog' | 'cat'
  concernTypes: ConcernType[]
  additionalNotes: string
  onsetTiming: OnsetTiming | null
  physicalSymptoms: PhysicalSymptom[]
  recentChanges: RecentChange[]
  worryLevel: 1 | 2 | 3 | 4 | 5 | null
}

export type Recommendation = 'monitor' | 'try_this' | 'call_vet'

export type ResolutionOutcome = 'resolved_itself' | 'tried_something' | 'visited_vet'

export interface Resolution {
  outcome: ResolutionOutcome
  notes: string
  resolvedAt: Date
}

export interface HistoryEntry {
  id: string
  petId?: string
  concernSummary: string
  recommendation: Recommendation
  createdAt: Date
  resolved: boolean | null
  result?: AssessmentResult
  resolution?: Resolution
}

export interface AssessmentResult {
  likely_explanations: string[]
  what_to_watch_for: string[]
  recommendation: Recommendation
  suggested_actions: string[]
  questions_for_vet: string[]
  reassurance_note: string
}

export type DogSex = 'male' | 'female'
export type SpayedNeuteredStatus = 'yes' | 'no' | 'not_sure'
export type EatingPattern = 'eats_everything' | 'moderate_eater' | 'picky_eater' | 'variable'
export type EnergyPattern = 'very_active' | 'moderately_active' | 'calm' | 'low_energy'
export type MoodPattern = 'very_social' | 'friendly' | 'independent' | 'anxious'
export type HealthCondition =
  | 'allergies' | 'joint_issues' | 'heart_condition' | 'diabetes' | 'seizures'
  | 'urinary_kidney' | 'dental_disease' | 'thyroid_issues' | 'asthma'
  | 'none' | 'other'
export type PetType = 'dog' | 'cat'

export interface PetProfile {
  id: string
  type: PetType
  name: string
  photoUrl: string | null
  breed: string
  isPuppy: boolean
  ageYears: number | null
  weightLbs: number
  sex: DogSex
  spayedNeutered: SpayedNeuteredStatus
  normalEating: EatingPattern
  normalEnergy: EnergyPattern
  normalMood: MoodPattern
  healthConditions: HealthCondition[]
  medications: string
  vetClinicName: string
  createdAt: string
  // Cat-specific (only used when type === 'cat')
  indoorOutdoor?: 'indoor' | 'outdoor' | 'both'
  normalLitterBox?: string
  normalGrooming?: string
}

// Keep aliases so existing imports don't break
export type DogProfile = PetProfile
export type DogProfileDraft = Partial<Omit<PetProfile, 'id'>>

interface AppState {
  // Multi-pet state
  pets: PetProfile[]
  activePetId: string | null
  getActivePet: () => PetProfile | null
  addPet: (pet: PetProfile) => void
  removePet: (petId: string) => void
  setActivePet: (petId: string) => void
  updatePet: (petId: string, updates: Partial<PetProfile>) => void
  getPetAssessments: (petId: string) => HistoryEntry[]

  // Backward-compat — mirrors active pet
  dogProfile: PetProfile | null
  setDogProfile: (profile: PetProfile) => void

  // Unchanged
  activeTab: string
  setActiveTab: (tab: string) => void
  currentAssessment: ConcernAssessmentInput | null
  setCurrentAssessment: (input: ConcernAssessmentInput) => void
  assessmentResult: AssessmentResult | null
  setAssessmentResult: (result: AssessmentResult) => void
  assessmentHistory: HistoryEntry[]
  addToHistory: (entry: HistoryEntry) => void
  resolveAssessment: (id: string, outcome: ResolutionOutcome, notes: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  pets: [MOCK_DOG_PROFILE, MOCK_CAT_PROFILE],
  activePetId: 'mock-profile-1',
  dogProfile: MOCK_DOG_PROFILE,

  getActivePet: () => {
    const { pets, activePetId } = get()
    return pets.find((p) => p.id === activePetId) ?? null
  },

  addPet: (pet) =>
    set((s) => {
      const isFirst = s.pets.length === 0
      return {
        pets: [...s.pets, pet],
        ...(isFirst ? { activePetId: pet.id, dogProfile: pet } : {}),
      }
    }),

  removePet: (petId) =>
    set((s) => {
      const remaining = s.pets.filter((p) => p.id !== petId)
      const history = s.assessmentHistory.filter((e) => e.petId !== petId)
      if (s.activePetId === petId) {
        const next = remaining[0] ?? null
        return { pets: remaining, assessmentHistory: history, activePetId: next?.id ?? null, dogProfile: next }
      }
      return { pets: remaining, assessmentHistory: history }
    }),

  setActivePet: (petId) =>
    set((s) => {
      const pet = s.pets.find((p) => p.id === petId) ?? null
      return { activePetId: petId, dogProfile: pet }
    }),

  updatePet: (petId, updates) =>
    set((s) => {
      const pets = s.pets.map((p) => (p.id === petId ? { ...p, ...updates } : p))
      const updated = pets.find((p) => p.id === petId) ?? null
      return {
        pets,
        ...(s.activePetId === petId ? { dogProfile: updated } : {}),
      }
    }),

  getPetAssessments: (petId) => {
    return get().assessmentHistory.filter((e) => e.petId === petId)
  },

  setDogProfile: (profile) =>
    set((s) => {
      const exists = s.pets.find((p) => p.id === profile.id)
      if (exists) {
        const pets = s.pets.map((p) => (p.id === profile.id ? profile : p))
        return {
          pets,
          dogProfile: profile,
          activePetId: profile.id,
        }
      }
      return {
        pets: [...s.pets, profile],
        dogProfile: profile,
        activePetId: profile.id,
      }
    }),

  activeTab: '/',
  setActiveTab: (tab) => set({ activeTab: tab }),
  currentAssessment: null,
  setCurrentAssessment: (input) => set({ currentAssessment: input }),
  assessmentResult: null,
  setAssessmentResult: (result) => set({ assessmentResult: result }),
  assessmentHistory: [...MOCK_HISTORY],
  addToHistory: (entry) =>
    set((s) => ({
      assessmentHistory: [
        ...s.assessmentHistory,
        { ...entry, petId: entry.petId ?? s.activePetId ?? undefined },
      ],
    })),
  resolveAssessment: (id, outcome, notes) =>
    set((s) => ({
      assessmentHistory: s.assessmentHistory.map((e) =>
        e.id === id
          ? { ...e, resolved: true, resolution: { outcome, notes, resolvedAt: new Date() } }
          : e,
      ),
    })),
}))
