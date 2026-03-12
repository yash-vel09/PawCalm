import { create } from 'zustand'

export type ConcernType = 'not_eating' | 'low_energy' | 'vomiting' | 'bathroom_issues' | 'unusual_barking' | 'aggression' | 'limping' | 'something_else'
export type OnsetTiming = 'within_the_hour' | 'earlier_today' | 'yesterday' | 'few_days' | 'week_or_more'
export type PhysicalSymptom = 'excessive_drooling' | 'shaking' | 'coughing' | 'sneezing' | 'eye_discharge' | 'swelling' | 'skin_changes' | 'bad_breath' | 'excessive_thirst' | 'weight_change' | 'none'
export type RecentChange = 'new_food' | 'moved_home' | 'new_pet' | 'new_family_member' | 'schedule_change' | 'boarding_travel' | 'weather_change' | 'new_medication' | 'vet_visit' | 'loss_of_companion' | 'nothing_changed'

export interface ConcernAssessmentInput {
  concernTypes: ConcernType[]
  additionalNotes: string
  onsetTiming: OnsetTiming | null
  physicalSymptoms: PhysicalSymptom[]
  recentChanges: RecentChange[]
  worryLevel: 1 | 2 | 3 | 4 | 5 | null
}

export type Recommendation = 'monitor' | 'try_this' | 'call_vet'

export interface HistoryEntry {
  id: string
  concernSummary: string
  recommendation: Recommendation
  createdAt: Date
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
export type HealthCondition = 'allergies' | 'joint_issues' | 'heart_condition' | 'diabetes' | 'seizures' | 'none' | 'other'

export interface DogProfile {
  id: string
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
}

export type DogProfileDraft = Partial<Omit<DogProfile, 'id'>>

interface AppState {
  dogProfile: DogProfile | null
  setDogProfile: (profile: DogProfile) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  currentAssessment: ConcernAssessmentInput | null
  setCurrentAssessment: (input: ConcernAssessmentInput) => void
  assessmentResult: AssessmentResult | null
  setAssessmentResult: (result: AssessmentResult) => void
  assessmentHistory: HistoryEntry[]
  addToHistory: (entry: HistoryEntry) => void
}

export const useAppStore = create<AppState>((set) => ({
  dogProfile: null,
  setDogProfile: (profile) => set({ dogProfile: profile }),
  activeTab: '/',
  setActiveTab: (tab) => set({ activeTab: tab }),
  currentAssessment: null,
  setCurrentAssessment: (input) => set({ currentAssessment: input }),
  assessmentResult: null,
  setAssessmentResult: (result) => set({ assessmentResult: result }),
  assessmentHistory: [],
  addToHistory: (entry) => set((s) => ({ assessmentHistory: [...s.assessmentHistory, entry] })),
}))
