'use client'

import { useState } from 'react'
import { Utensils, Zap, Droplets, Smile, Check } from 'lucide-react'

type Status = 'normal' | 'not_normal' | null

interface LogItem {
  key: string
  label: string
  Icon: typeof Utensils
}

const ITEMS: LogItem[] = [
  { key: 'eating', label: 'Eating', Icon: Utensils },
  { key: 'energy', label: 'Energy', Icon: Zap },
  { key: 'bathroom', label: 'Bathroom', Icon: Droplets },
  { key: 'mood', label: 'Mood', Icon: Smile },
]

export default function QuickLog() {
  const [log, setLog] = useState<Record<string, Status>>({})

  function toggle(key: string) {
    setLog((prev) => {
      const current = prev[key]
      if (current === null || current === undefined) return { ...prev, [key]: 'normal' }
      if (current === 'normal') return { ...prev, [key]: 'not_normal' }
      return { ...prev, [key]: null }
    })
  }

  return (
    <div className="pb-2">
      <h2 className="text-base font-semibold text-calm-navy mb-3">Daily Check-in</h2>
      <div className="grid grid-cols-4 gap-2">
        {ITEMS.map(({ key, label, Icon }) => {
          const status = log[key] ?? null
          const isNormal = status === 'normal'
          const isOff = status === 'not_normal'

          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              aria-label={`${label}: ${status === 'normal' ? 'normal' : status === 'not_normal' ? 'off' : 'not logged'}`}
              aria-pressed={status !== null}
              className={`relative flex flex-col items-center gap-1.5 py-3 rounded-card border-2 transition-colors duration-150 ${
                isNormal
                  ? 'bg-light-teal border-pawcalm-teal'
                  : isOff
                  ? 'bg-soft-amber-bg border-try-amber'
                  : 'bg-white border-warm-gray'
              }`}
            >
              {isNormal && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-pawcalm-teal rounded-full flex items-center justify-center">
                  <Check size={10} className="text-white" strokeWidth={3} />
                </span>
              )}
              <Icon
                size={20}
                className={
                  isNormal
                    ? 'text-pawcalm-teal'
                    : isOff
                    ? 'text-try-amber'
                    : 'text-medium-gray'
                }
              />
              <span
                className={`text-[11px] font-medium leading-tight ${
                  isNormal
                    ? 'text-pawcalm-teal'
                    : isOff
                    ? 'text-try-amber'
                    : 'text-medium-gray'
                }`}
              >
                {label}
              </span>
              {isOff && (
                <span className="text-[10px] text-try-amber font-semibold -mt-0.5">Off</span>
              )}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-medium-gray mt-2 text-center">
        Tap to mark as normal. Tap again if something seems off.
      </p>
    </div>
  )
}
