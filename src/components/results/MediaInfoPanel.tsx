import type { JobResult, MediaPreparationPayload } from '../../types/api.types'
import { formatDuration } from '../../utils/formatters'

interface Props {
  result: JobResult<MediaPreparationPayload>
  cmsId: string
}

export function MediaInfoPanel({ result, cmsId }: Props) {
  const { media_duration_s, scene_count } = result.payload

  return (
    <div className="flex flex-wrap gap-4 px-5 py-3 bg-blue-50 rounded-xl border border-blue-100">
      <div>
        <p className="text-xs text-blue-400">影片 ID</p>
        <p className="text-sm font-semibold text-blue-800">{cmsId}</p>
      </div>
      <div>
        <p className="text-xs text-blue-400">影片時長</p>
        <p className="text-sm font-semibold text-blue-800">{formatDuration(media_duration_s)}</p>
      </div>
      <div>
        <p className="text-xs text-blue-400">場景數</p>
        <p className="text-sm font-semibold text-blue-800">{scene_count} 個場景</p>
      </div>
    </div>
  )
}
