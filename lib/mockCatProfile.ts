import type { PetProfile } from '@/store'

export const MOCK_CAT_PROFILE: PetProfile = {
  id: 'mock-cat-1',
  type: 'cat',
  name: 'Mochi',
  photoUrl: null,
  breed: 'British Shorthair',
  isPuppy: false,
  ageYears: 3,
  weightLbs: 10,
  sex: 'female',
  spayedNeutered: 'yes',
  normalEating: 'moderate_eater',
  normalEnergy: 'calm',
  normalMood: 'independent',
  healthConditions: ['none'],
  medications: '',
  vetClinicName: 'City Cats Veterinary',
  createdAt: '2026-01-15T00:00:00.000Z',
  indoorOutdoor: 'indoor',
  normalLitterBox: 'Uses consistently, once or twice daily',
  normalGrooming: 'Self-grooms regularly, coat always clean',
}
