'use client'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Keep',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative bg-white rounded-card p-5 w-full max-w-sm shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[17px] font-semibold text-calm-navy mb-1.5">{title}</h3>
        <p className="text-[14px] text-medium-gray leading-relaxed mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 border-2 border-warm-gray rounded-button text-sm font-semibold text-calm-navy"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-button text-sm font-semibold text-call-vet-red border-2 border-call-vet-red/30"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
