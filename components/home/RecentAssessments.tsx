import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import { HistoryEntry } from '@/store'
import AssessmentCard from './AssessmentCard'

interface RecentAssessmentsProps {
  assessments: HistoryEntry[]
  dogName: string
}

export default function RecentAssessments({ assessments, dogName }: RecentAssessmentsProps) {
  return (
    <div>
      <h2 className="text-base font-semibold text-calm-navy mb-3">Recent Activity</h2>

      {assessments.length === 0 ? (
        <div className="bg-white rounded-card p-6 shadow-sm border border-warm-gray flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-warm-gray flex items-center justify-center">
            <ClipboardList size={22} className="text-medium-gray" />
          </div>
          <div>
            <p className="text-sm font-semibold text-calm-navy">No assessments yet</p>
            <p className="text-xs text-medium-gray mt-1 leading-relaxed">
              No assessments yet for {dogName}. Tap &ldquo;Log a Concern&rdquo; above.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {assessments.map((a) => (
            <AssessmentCard key={a.id} assessment={a} />
          ))}
          <Link href="/history">
            <p className="text-pawcalm-teal text-sm font-semibold text-right mt-3 pr-1">
              View all history →
            </p>
          </Link>
        </div>
      )}
    </div>
  )
}
