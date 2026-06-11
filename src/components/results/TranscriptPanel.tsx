import type { JobResult, TranscriptionPayload } from '../../types/api.types'
import { ResultCard } from '../ui/ResultCard'
import { formatSeconds } from '../../utils/formatters'

interface Props {
  result: JobResult<TranscriptionPayload>
}

export function TranscriptPanel({ result }: Props) {
  const { segments } = result.payload

  return (
    <ResultCard title="逐字稿" icon="🗣️">
      <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="group flex gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <span className="shrink-0 text-xs text-blue-500 font-mono pt-0.5 w-24">
              [{formatSeconds(seg.start_seconds)} - {formatSeconds(seg.end_seconds)}]
            </span>
            <div className="flex-1 min-w-0">
              {seg.speaker_id && (
                <span className="text-xs text-gray-400 mr-1">{seg.speaker_id}</span>
              )}
              <span className="text-sm text-gray-800">{seg.text}</span>
            </div>
            {seg.confidence_score != null && (
              <span className="shrink-0 text-xs text-gray-300 group-hover:text-gray-400">
                {(seg.confidence_score * 100).toFixed(0)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </ResultCard>
  )
}
