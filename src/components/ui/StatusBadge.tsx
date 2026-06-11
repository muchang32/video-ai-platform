import type { JobStatus } from '../../types/api.types'
import { JOB_STATUS_CONFIG } from '../../utils/formatters'

interface Props {
  status: JobStatus
}

export function StatusBadge({ status }: Props) {
  const config = JOB_STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-500' }
  const isPulsing = status === 'RUNNING' || status === 'PENDING'

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {isPulsing && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
        </span>
      )}
      {config.label}
    </span>
  )
}
