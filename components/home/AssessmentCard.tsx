import Link from 'next/link'
import { HistoryEntry } from '@/store'
import { formatRelativeTime } from '@/lib/formatTime'

const BADGE: Record<HistoryEntry['recommendation'], { label: string; className: string }> = {
  monitor: {
    label: 'Monitor',
    className: 'bg-soft-green-bg text-monitor-green border border-monitor-green/20',
  },
  try_this: {
    label: 'Try This',
    className: 'bg-soft-amber-bg text-try-amber border border-try-amber/20',
  },
  call_vet: {
    label: 'Call Vet',
    className: 'bg-soft-red-bg text-call-vet-red border border-call-vet-red/20',
  },
}

const LEFT_BORDER: Record<HistoryEntry['recommendation'], string> = {
  monitor: 'border-l-4 border-l-monitor-green',
  try_this: 'border-l-4 border-l-try-amber',
  call_vet: 'border-l-4 border-l-call-vet-red',
}

export default function AssessmentCard({ assessment }: { assessment: HistoryEntry }) {
  const badge = BADGE[assessment.recommendation]
  const border = LEFT_BORDER[assessment.recommendation]

  return (
    <Link href={`/assessment/${assessment.id}`}>
      <div className={`bg-white rounded-card px-4 py-3 shadow-sm ${border} flex items-center gap-3`}>
        <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${badge.className}`}>
          {badge.label}
        </span>
        <p className="flex-1 text-sm text-calm-navy truncate">{assessment.concernSummary}</p>
        <span className="text-xs text-medium-gray shrink-0">
          {formatRelativeTime(assessment.createdAt)}
        </span>
      </div>
    </Link>
  )
}
