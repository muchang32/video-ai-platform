import type { JobResult, SummarizationPayload } from '../../types/api.types'
import { ResultCard } from '../ui/ResultCard'

interface Props {
  result: JobResult<SummarizationPayload>
}

export function SummaryPanel({ result }: Props) {
  const { summary_text } = result.payload

  return (
    <ResultCard title="摘要" icon="📝">
      <blockquote className="border-l-4 border-blue-300 pl-4 text-gray-700 leading-relaxed">
        {summary_text}
      </blockquote>
    </ResultCard>
  )
}
