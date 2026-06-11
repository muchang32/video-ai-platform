import type { JobSummary, BatchStatus } from '../../types/api.types'
import { JobCard } from './JobCard'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { BATCH_STATUS_CONFIG } from '../../utils/formatters'

const JOB_ORDER = [
  'MEDIA_PREPARATION',
  'TRANSCRIPTION',
  'DETECTION',
  'TAG_EXTRACTION',
  'SUMMARIZATION',
  'METADATA_FUSION',
]

interface Props {
  jobs: JobSummary[]
  batchStatus: BatchStatus | null
  isPolling: boolean
}

export function PipelineStatus({ jobs, batchStatus, isPolling }: Props) {
  const orderedJobs = JOB_ORDER.map(
    (type) => jobs.find((j) => j.job_type === type)
  ).filter(Boolean) as JobSummary[]

  const statusConfig = batchStatus ? BATCH_STATUS_CONFIG[batchStatus] : null
  const completedCount = jobs.filter((j) => j.status === 'COMPLETED').length

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isPolling && <LoadingSpinner size="sm" />}
          <h2 className="text-lg font-semibold text-gray-800">
            {batchStatus === 'COMPLETED'
              ? '✅ 分析完成'
              : batchStatus === 'PARTIAL_SUCCESS'
              ? '⚠️ 部分分析完成'
              : batchStatus === 'FAILED'
              ? '❌ 分析失敗'
              : 'AI 分析進行中'}
          </h2>
        </div>
        {statusConfig && (
          <span className={`text-sm font-medium ${statusConfig.className}`}>
            {completedCount} / {jobs.length || 6} 完成
          </span>
        )}
      </div>

      {batchStatus === 'PARTIAL_SUCCESS' && (
        <div className="mb-4 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
          部分分析步驟未能完成，仍可查看已產生的結果。
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {orderedJobs.length > 0
          ? orderedJobs.map((job) => <JobCard key={job.job_id} job={job} />)
          : JOB_ORDER.map((type) => (
              <div
                key={type}
                className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 animate-pulse h-12"
              />
            ))}
      </div>
    </div>
  )
}
