import type { DogProfile } from '@/store'

export const MOCK_DOG_PROFILE: DogProfile = {
  id: 'mock-profile-1',
  name: 'Luna',
  photoUrl: null,
  breed: 'Golden Retriever',
  isPuppy: false,
  ageYears: 4,
  weightLbs: 65,
  sex: 'female',
  spayedNeutered: 'yes',
  normalEating: 'eats_everything',
  normalEnergy: 'very_active',
  normalMood: 'very_social',
  healthConditions: ['none'],
  medications: 'Monthly heartworm preventative',
  vetClinicName: 'Happy Paws Veterinary',
}
