import type { JobResult, DetectionPayload } from '../../types/api.types'
import { ResultCard } from '../ui/ResultCard'
import { DETECTION_TYPE_LABELS, formatSeconds } from '../../utils/formatters'

interface Props {
  result: JobResult<DetectionPayload>
}

export function DetectionPanel({ result }: Props) {
  const { detections } = result.payload

  if (!detections || detections.length === 0) return null

  return (
    <ResultCard title="影像偵測" icon="👁️">
      <div className="divide-y divide-gray-100">
        {detections.map((det, i) => (
          <div key={i} className="flex items-center justify-between py-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                {DETECTION_TYPE_LABELS[det.detection_type] ?? det.detection_type}
              </span>
              <span className="text-sm text-gray-800">{det.label}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
              {det.start_seconds != null && det.end_seconds != null && (
                <span className="font-mono">
                  {formatSeconds(det.start_seconds)} - {formatSeconds(det.end_seconds)}
                </span>
              )}
              {det.confidence_score != null && (
                <span>{(det.confidence_score * 100).toFixed(0)}%</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </ResultCard>
  )
}
