'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, X, Utensils, Zap, Droplets, Box, Smile, Check, AlertCircle } from 'lucide-react'
import { useAppStore } from '@/store'
import type { PetType, WellnessStatus } from '@/store'

type CategoryKey = 'eating' | 'energy' | 'bathroom' | 'litter' | 'mood'

interface Category {
  key: CategoryKey
  label: string
  Icon: typeof Utensils
  question: (name: string) => string
  options: { label: string; value: WellnessStatus; isNormal: boolean }[]
}

const DOG_CATEGORIES: Category[] = [
  {
    key: 'eating',
    label: 'Eating',
    Icon: Utensils,
    question: (name) => `How was ${name}'s eating?`,
    options: [
      { label: 'Normal', value: 'normal', isNormal: true },
      { label: 'Less than usual', value: 'less', isNormal: false },
      { label: 'More than usual', value: 'more', isNormal: false },
      { label: "Didn't eat", value: 'none', isNormal: false },
    ],
  },
  {
    key: 'energy',
    label: 'Energy',
    Icon: Zap,
    question: (name) => `How was ${name}'s energy?`,
    options: [
      { label: 'Normal', value: 'normal', isNormal: true },
      { label: 'Low', value: 'low', isNormal: false },
      { label: 'High', value: 'high', isNormal: false },
    ],
  },
  {
    key: 'bathroom',
    label: 'Bathroom',
    Icon: Droplets,
    question: (name) => `How was ${name}'s bathroom?`,
    options: [
      { label: 'Normal', value: 'normal', isNormal: true },
      { label: 'Irregular', value: 'irregular', isNormal: false },
    ],
  },
  {
    key: 'mood',
    label: 'Mood',
    Icon: Smile,
    question: (name) => `How was ${name}'s mood?`,
    options: [
      { label: 'Happy', value: 'happy', isNormal: true },
      { label: 'Anxious', value: 'anxious', isNormal: false },
      { label: 'Lethargic', value: 'lethargic', isNormal: false },
    ],
  },
]

const CAT_CATEGORIES: Category[] = [
  {
    key: 'eating',
    label: 'Eating',
    Icon: Utensils,
    question: (name) => `How was ${name}'s eating?`,
    options: [
      { label: 'Normal', value: 'normal', isNormal: true },
      { label: 'Less than usual', value: 'less', isNormal: false },
      { label: 'More than usual', value: 'more', isNormal: false },
      { label: "Didn't eat", value: 'none', isNormal: false },
    ],
  },
  {
    key: 'energy',
    label: 'Energy',
    Icon: Zap,
    question: (name) => `How was ${name}'s energy?`,
    options: [
      { label: 'Normal', value: 'normal', isNormal: true },
      { label: 'Low', value: 'low', isNormal: false },
      { label: 'High', value: 'high', isNormal: false },
    ],
  },
  {
    key: 'litter',
    label: 'Litter Box',
    Icon: Box,
    question: (name) => `How was ${name}'s litter box?`,
    options: [
      { label: 'Normal', value: 'normal', isNormal: true },
      { label: 'Irregular', value: 'irregular', isNormal: false },
    ],
  },
  {
    key: 'mood',
    label: 'Mood',
    Icon: Smile,
    question: (name) => `How was ${name}'s mood?`,
    options: [
      { label: 'Happy', value: 'happy', isNormal: true },
      { label: 'Anxious', value: 'anxious', isNormal: false },
      { label: 'Lethargic', value: 'lethargic', isNormal: false },
    ],
  },
]

const STATUS_BAR: Record<WellnessStatus, { height: number; color: string; topBorderColor?: string }> = {
  // shared normal
  normal:    { height: 28, color: 'rgba(34, 197, 94, 0.7)' },
  // eating
  less:      { height: 18, color: 'rgba(245, 158, 11, 0.7)' },
  more:      { height: 32, color: 'rgba(13, 148, 136, 0.7)' },
  none:      { height: 6,  color: 'rgba(239, 68, 68, 0.7)' },
  // energy
  low:       { height: 14, color: 'rgba(245, 158, 11, 0.7)' },
  high:      { height: 32, color: 'rgba(13, 148, 136, 0.7)' },
  // bathroom / litter
  irregular: { height: 14, color: 'rgba(245, 158, 11, 0.7)' },
  // mood
  happy:     { height: 28, color: 'rgba(34, 197, 94, 0.7)' },
  anxious:   { height: 18, color: 'rgba(245, 158, 11, 0.7)' },
  lethargic: { height: 8,  color: 'rgba(239, 68, 68, 0.7)' },
}

const STATUS_LABEL: Record<WellnessStatus, string> = {
  normal:    'Normal',
  less:      'Less than usual',
  more:      'More than usual',
  none:      "Didn't eat",
  low:       'Low energy',
  high:      'High energy',
  irregular: 'Irregular',
  happy:     'Happy',
  anxious:   'Anxious',
  lethargic: 'Lethargic',
}

function getBarSpec(status: WellnessStatus | null): { height: number; color: string; topBorderColor?: string } {
  if (status === null) return { height: 10, color: '#E5E5E5' }
  return STATUS_BAR[status] ?? { height: 10, color: '#E5E5E5' }
}

const NORMAL_STATUSES = new Set<WellnessStatus>(['normal', 'happy'])

function getWeekDays(): Date[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayOfWeek = today.getDay() // 0 = Sun
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const DAY_ABBRS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface SheetState {
  categoryKey: CategoryKey
  dateKey: string
  dateLabel: string
}

interface ActiveTooltip {
  status: WellnessStatus
  categoryLabel: string
  dateLabel: string
}

interface Props {
  petType: PetType
}

export default function WeeklyWellnessCard({ petType }: Props) {
  const activePetId = useAppStore((s) => s.activePetId)
  const getActivePet = useAppStore((s) => s.getActivePet)
  const wellnessLogs = useAppStore((s) => s.wellnessLogs)
  const setWellnessLog = useAppStore((s) => s.setWellnessLog)

  const pet = getActivePet()
  const petName = pet?.name ?? 'your pet'
  const categories = petType === 'cat' ? CAT_CATEGORIES : DOG_CATEGORIES
  const weekDays = getWeekDays()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayKey = toDateKey(today)

  const [showInfo, setShowInfo] = useState(false)
  const [sheet, setSheet] = useState<SheetState | null>(null)
  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltip | null>(null)
  const [justLogged, setJustLogged] = useState<string | null>(null)
  const [hoveredDot, setHoveredDot] = useState<string | null>(null)
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialAnimDoneRef = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => {
      initialAnimDoneRef.current = true
    }, 2500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current)
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    }
  }, [])

  function getStatus(dateKey: string, categoryKey: CategoryKey): WellnessStatus | null {
    if (!activePetId) return null
    return (wellnessLogs[`${activePetId}_${dateKey}_${categoryKey}`] as WellnessStatus) ?? null
  }

  function isFuture(date: Date): boolean {
    return date > today
  }

  function handleDotClick(day: Date, category: Category) {
    if (isFuture(day)) return
    const dateKey = toDateKey(day)
    const status = getStatus(dateKey, category.key)
    if (status !== null) {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current)
      setActiveTooltip({
        status,
        categoryLabel: category.label,
        dateLabel: formatDateLabel(day),
      })
      tooltipTimerRef.current = setTimeout(() => setActiveTooltip(null), 2500)
      return
    }
    setSheet({ categoryKey: category.key, dateKey, dateLabel: formatDateLabel(day) })
  }

  function handleDotMouseEnter(dotKey: string) {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    hoverTimerRef.current = setTimeout(() => setHoveredDot(dotKey), 200)
  }

  function handleDotMouseLeave() {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    setHoveredDot(null)
  }

  function handleTodayButtonClick(category: Category) {
    setSheet({
      categoryKey: category.key,
      dateKey: todayKey,
      dateLabel: formatDateLabel(today),
    })
  }

  function handleSheetOption(value: WellnessStatus) {
    if (!sheet || !activePetId) return
    setWellnessLog(activePetId, sheet.dateKey, sheet.categoryKey, value)
    const loggedKey = `${sheet.dateKey}_${sheet.categoryKey}`
    setJustLogged(loggedKey)
    setTimeout(() => setJustLogged(null), 600)
    setSheet(null)
  }

  const currentCategory = sheet ? categories.find((c) => c.key === sheet.categoryKey) : null

  const loggedDaysCount = weekDays.filter((day) => {
    const dateKey = toDateKey(day)
    return categories.some((cat) => getStatus(dateKey, cat.key) !== null)
  }).length

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-card border border-warm-gray shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-0.5">
          <h3 className="text-[18px] font-semibold text-calm-navy leading-tight">
            {petName}&apos;s Week
          </h3>
          <div className="relative">
            <button
              type="button"
              aria-label="About weekly wellness tracking"
              aria-expanded={showInfo}
              onClick={() => setShowInfo((v) => !v)}
              className="w-7 h-7 flex items-center justify-center text-medium-gray -mt-0.5 -mr-1"
            >
              <Info size={16} strokeWidth={1.5} />
            </button>

            <AnimatePresence>
              {showInfo && (
                <>
                  {/* Dismiss backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowInfo(false)}
                  />
                  {/* Popover */}
                  <motion.div
                    key="info-popover"
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-8 z-20 w-[280px] bg-white rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] p-4"
                  >
                    <p className="text-[15px] font-semibold text-calm-navy mb-1.5">How this works</p>
                    <p className="text-[13px] text-medium-gray leading-relaxed">
                      Track your pet&apos;s daily patterns at a glance. Green means normal, amber means
                      something seemed off. Tap any bar to log or view details. Consistent tracking
                      helps PawCalm spot changes early.
                    </p>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
        <p className="text-[13px] text-medium-gray mb-4">Last 7 days</p>

        {/* Column headers */}
        <div className="flex items-end mb-2" style={{ paddingLeft: 70 }}>
          {weekDays.map((day, i) => {
            const dateKey = toDateKey(day)
            const isToday = dateKey === todayKey
            return (
              <div key={dateKey} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <span
                  className={`text-[11px] leading-none ${
                    isToday ? 'text-pawcalm-teal font-semibold' : 'text-medium-gray'
                  }`}
                >
                  {DAY_ABBRS[i]}
                </span>
                <div
                  className={`h-0.5 rounded-full ${isToday ? 'bg-pawcalm-teal' : 'bg-transparent'}`}
                  style={{ width: 16 }}
                />
              </div>
            )
          })}
        </div>

        {/* Category rows — Bar Grid */}
        <div className="flex flex-col gap-2.5">
          {categories.map((category) => (
            <div key={category.key} className="flex" style={{ height: 44 }}>
              {/* Row label — vertically centered */}
              <div className="shrink-0 self-center" style={{ width: 70 }}>
                <span className="text-[12px] text-medium-gray leading-none">{category.label}</span>
              </div>

              {/* Bars — bottom-aligned */}
              <div className="flex-1 flex items-end">
                {weekDays.map((day, colIdx) => {
                  const dateKey = toDateKey(day)
                  const status = getStatus(dateKey, category.key)
                  const future = isFuture(day)
                  const barKey = `${dateKey}_${category.key}`
                  const isLogged = status !== null
                  const showHoverTooltip = isLogged && !future && hoveredDot === barKey
                  const barSpec = getBarSpec(status)

                  return (
                    <div
                      key={dateKey}
                      className="flex-1 flex flex-col items-center justify-end relative"
                      style={{ height: 44 }}
                    >
                      {/* Hover tooltip — desktop only */}
                      <AnimatePresence>
                        {showHoverTooltip && (
                          <motion.div
                            key="hover-tip"
                            initial={{ opacity: 0, y: 3, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, y: 3, x: '-50%' }}
                            transition={{ duration: 0.12 }}
                            className="absolute bottom-full mb-2 left-1/2 z-30 pointer-events-none"
                          >
                            <div
                              className="relative bg-calm-navy text-white text-[12px] rounded-[8px] shadow-md"
                              style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}
                            >
                              {category.label}: {status ? STATUS_LABEL[status] : ''}
                              {/* Downward caret */}
                              <div
                                className="absolute top-full left-1/2 -translate-x-1/2"
                                style={{
                                  width: 0,
                                  height: 0,
                                  borderLeft: '5px solid transparent',
                                  borderRight: '5px solid transparent',
                                  borderTop: '5px solid #1E293B',
                                }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.button
                        type="button"
                        initial={{ height: 10 }}
                        animate={{ height: barSpec.height }}
                        transition={{
                          duration: 0.2,
                          ease: 'easeOut',
                          delay: initialAnimDoneRef.current ? 0 : colIdx * 0.05,
                        }}
                        onClick={() => handleDotClick(day, category)}
                        onMouseEnter={() => { if (isLogged && !future) handleDotMouseEnter(barKey) }}
                        onMouseLeave={handleDotMouseLeave}
                        disabled={future}
                        aria-label={`${category.label} ${DAY_ABBRS[colIdx]}: ${
                          status !== null
                            ? STATUS_LABEL[status]
                            : future
                            ? 'Not yet'
                            : 'Not logged — tap to log'
                        }`}
                        className={`shrink-0 ${
                          !future && status === null
                            ? 'cursor-pointer'
                            : future
                            ? 'cursor-default opacity-40'
                            : 'cursor-pointer'
                        }`}
                        style={{
                          width: 16,
                          backgroundColor: barSpec.color,
                          borderRadius: '4px 4px 0 0',
                          ...(barSpec.topBorderColor && { borderTop: `2px solid ${barSpec.topBorderColor}` }),
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Tooltip info strip */}
        <AnimatePresence>
          {activeTooltip && (
            <motion.div
              key="tooltip"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="mt-3 px-3 py-2 bg-calm-navy rounded-[10px] flex items-center gap-2"
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor: STATUS_BAR[activeTooltip.status]?.color ?? '#E5E5E5',
                }}
              />
              <span className="text-[12px] text-white">
                {activeTooltip.categoryLabel}:{' '}
                {STATUS_LABEL[activeTooltip.status]} —{' '}
                {activeTooltip.dateLabel}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary row */}
        <div className="mt-3 pt-3 border-t border-warm-gray">
          {loggedDaysCount === 0 ? (
            <p className="text-[13px] text-medium-gray">
              Tap a bar to start tracking {petName}&apos;s week
            </p>
          ) : loggedDaysCount === 7 ? (
            <p className="text-[13px] font-semibold text-pawcalm-teal">All caught up!</p>
          ) : (
            <div className="space-y-2">
              <p className="text-[13px] text-medium-gray">
                <span className="font-semibold text-calm-navy">
                  {loggedDaysCount} of 7 days
                </span>{' '}
                logged this week
              </p>
              <div
                className="w-full bg-warm-gray rounded-full overflow-hidden"
                style={{ height: 6 }}
              >
                <motion.div
                  className="h-full bg-pawcalm-teal rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(loggedDaysCount / 7) * 100}%` }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Today's Check-in */}
        <div className="mt-3 pt-3 border-t border-warm-gray">
          <p className="text-[16px] font-medium text-calm-navy mb-2">Daily Check-in</p>
          <div className="flex gap-2 overflow-x-auto -mx-0.5 px-0.5">
            {categories.map((category) => {
              const status = getStatus(todayKey, category.key)
              const isNormal = status !== null && NORMAL_STATUSES.has(status)
              const isOff = status !== null && !NORMAL_STATUSES.has(status)

              return (
                <motion.button
                  key={category.key}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTodayButtonClick(category)}
                  aria-label={`Log today's ${category.label}${isNormal ? ': Normal' : isOff ? ': Off' : ''}`}
                  className={`flex-1 min-w-[72px] h-14 flex flex-col items-center justify-center gap-1 rounded-button border transition-colors duration-200 ${
                    isNormal
                      ? 'bg-soft-green-bg border-monitor-green/40'
                      : isOff
                      ? 'bg-soft-amber-bg border-try-amber/40'
                      : 'bg-white border border-dashed border-medium-gray'
                  }`}
                >
                  <category.Icon
                    size={16}
                    strokeWidth={1.5}
                    className={
                      isNormal
                        ? 'text-monitor-green'
                        : isOff
                        ? 'text-try-amber'
                        : 'text-medium-gray'
                    }
                  />
                  <span
                    className={`text-[11px] font-medium leading-none flex items-center gap-0.5 ${
                      isNormal
                        ? 'text-monitor-green'
                        : isOff
                        ? 'text-try-amber'
                        : 'text-medium-gray'
                    }`}
                  >
                    {category.label}
                    {isNormal && <Check size={9} strokeWidth={2.5} />}
                    {isOff && <AlertCircle size={9} strokeWidth={2} />}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Bottom sheet */}
      <AnimatePresence>
        {sheet && currentCategory && (
          <>
            <motion.div
              key="sheet-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setSheet(null)}
            />
            <motion.div
              key="sheet-panel"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[24px] pt-3 pb-10 shadow-2xl"
            >
              {/* Drag handle */}
              <div className="w-10 h-1 bg-warm-gray rounded-full mx-auto mb-4" />

              <div className="px-5">
                {/* Title row */}
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-[18px] font-semibold text-calm-navy leading-tight pr-4">
                    {currentCategory.question(petName)}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSheet(null)}
                    aria-label="Close"
                    className="w-8 h-8 flex items-center justify-center text-medium-gray shrink-0"
                  >
                    <X size={18} strokeWidth={1.5} />
                  </button>
                </div>
                <p className="text-[13px] text-medium-gray mb-5">{sheet.dateLabel}</p>

                {/* Options */}
                <div className="space-y-2.5">
                  {currentCategory.options.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => handleSheetOption(option.value)}
                      className={`w-full text-left px-4 py-4 rounded-button font-medium text-[15px] transition-colors duration-150 ${
                        option.isNormal
                          ? 'bg-soft-green-bg text-calm-navy active:bg-green-100'
                          : 'bg-warm-gray text-calm-navy active:bg-stone-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
