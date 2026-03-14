interface OptionChipProps {
  label: string
  selected: boolean
  onSelect: () => void
  className?: string
}

export default function OptionChip({ label, selected, onSelect, className }: OptionChipProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-button px-4 py-2.5 border-2 text-sm font-semibold transition-colors duration-150 ${
        selected
          ? 'bg-pawcalm-teal border-pawcalm-teal text-white'
          : `bg-white border-warm-gray text-calm-navy${className ? ` ${className}` : ''}`
      }`}
    >
      {label}
    </button>
  )
}
