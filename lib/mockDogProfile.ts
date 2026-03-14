import type { PetProfile } from '@/store'

export const MOCK_DOG_PROFILE: PetProfile = {
  id: 'mock-profile-1',
  type: 'dog',
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
  createdAt: '2025-11-10T00:00:00.000Z',
}
