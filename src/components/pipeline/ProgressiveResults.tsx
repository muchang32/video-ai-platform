import type { JobType, JobResult } from '../../types/api.types'
import type {
  TranscriptionPayload,
  TagExtractionPayload,
  SummarizationPayload,
  DetectionPayload,
  MediaPreparationPayload,
} from '../../types/api.types'
import { TranscriptPanel } from '../results/TranscriptPanel'
import { TagsPanel } from '../results/TagsPanel'
import { SummaryPanel } from '../results/SummaryPanel'
import { DetectionPanel } from '../results/DetectionPanel'

interface Props {
  results: Partial<Record<JobType, JobResult<unknown>>>
}

export function ProgressiveResults({ results }: Props) {
  const hasAny = Object.keys(results).length > 0

  if (!hasAny) return null

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">即時結果</h3>

      {results.SUMMARIZATION && (
        <SummaryPanel result={results.SUMMARIZATION as JobResult<SummarizationPayload>} />
      )}

      {results.TAG_EXTRACTION && (
        <TagsPanel result={results.TAG_EXTRACTION as JobResult<TagExtractionPayload>} />
      )}

      {results.TRANSCRIPTION && (
        <TranscriptPanel result={results.TRANSCRIPTION as JobResult<TranscriptionPayload>} />
      )}

      {results.DETECTION && (
        <DetectionPanel result={results.DETECTION as JobResult<DetectionPayload>} />
      )}

      {results.MEDIA_PREPARATION && (
        <div className="text-xs text-gray-400">
          影片解析完成 ✓ 共{' '}
          {(results.MEDIA_PREPARATION as JobResult<MediaPreparationPayload>).payload.scene_count} 個場景
        </div>
      )}
    </div>
  )
}
