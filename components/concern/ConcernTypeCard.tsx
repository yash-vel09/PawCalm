interface ConcernTypeCardProps {
  emoji: string
  label: string
  selected: boolean
  onSelect: () => void
  disabled?: boolean
}

export default function ConcernTypeCard({ emoji, label, selected, onSelect, disabled }: ConcernTypeCardProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onSelect}
      aria-label={label}
      aria-pressed={selected}
      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-card border-2 w-full min-h-[80px] transition-colors duration-150 ${
        disabled
          ? 'opacity-50 cursor-not-allowed border-warm-gray bg-warm-gray'
          : selected
          ? 'border-pawcalm-teal bg-light-teal'
          : 'border-warm-gray bg-white'
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <span className={`text-xs font-semibold text-center leading-tight ${selected && !disabled ? 'text-pawcalm-teal' : 'text-calm-navy'}`}>
        {label}
      </span>
    </button>
  )
}
