import type { JobSummary } from '../../types/api.types'
import { StatusBadge } from '../ui/StatusBadge'
import { JOB_LABELS, ERROR_CATEGORY_LABELS } from '../../utils/formatters'

interface Props {
  job: JobSummary
}

export function JobCard({ job }: Props) {
  const label = JOB_LABELS[job.job_type] ?? job.job_type

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white rounded-lg border border-gray-200">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex flex-col items-end gap-0.5">
        <StatusBadge status={job.status} />
        {job.status === 'FAILED' && job.error_category && (
          <span className="text-xs text-red-500">
            {ERROR_CATEGORY_LABELS[job.error_category] ?? job.error_category}
          </span>
        )}
      </div>
    </div>
  )
}
