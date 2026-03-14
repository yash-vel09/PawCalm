import { PetProfile } from '@/store'

export async function saveDogProfile(profile: PetProfile): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  console.log('[mockDataService] saveDogProfile called with:', profile)
}
