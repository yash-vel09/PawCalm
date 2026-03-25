'use client'

import { useRouter } from 'next/navigation'
import { Dog, Cat, Plus } from 'lucide-react'
import { useAppStore } from '@/store'

export default function PetSwitcher() {
  const router = useRouter()
  const pets = useAppStore((s) => s.pets)
  const activePetId = useAppStore((s) => s.activePetId)
  const setActivePet = useAppStore((s) => s.setActivePet)

  return (
    <div className="-mx-4 px-4">
      <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {pets.map((pet) => {
          const isActive = pet.id === activePetId
          return (
            <button
              key={pet.id}
              onClick={() => setActivePet(pet.id)}
              className={`flex items-center gap-1.5 h-10 pl-1.5 pr-4 rounded-full shrink-0 border transition-colors duration-200 ${
                isActive
                  ? 'bg-pawcalm-teal border-pawcalm-teal shadow-sm'
                  : 'bg-white border-warm-gray'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-warm-gray overflow-hidden flex items-center justify-center shrink-0">
                {pet.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-medium-gray">{pet.name[0]}</span>
                )}
              </div>
              <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-calm-navy'}`}>
                {pet.name}
              </span>
              {pet.type === 'cat' ? (
                <Cat size={14} className={isActive ? 'text-white/70' : 'text-medium-gray'} />
              ) : (
                <Dog size={14} className={isActive ? 'text-white/70' : 'text-medium-gray'} />
              )}
            </button>
          )
        })}

        <button
          onClick={() => router.push('/onboarding?mode=add')}
          className="flex items-center gap-1.5 h-10 px-4 rounded-full shrink-0 bg-light-teal border border-pawcalm-teal/30"
        >
          <Plus size={14} className="text-pawcalm-teal" />
          <span className="text-sm font-semibold text-pawcalm-teal">Add Pet</span>
        </button>
      </div>
    </div>
  )
}
