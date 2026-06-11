import type { JobResult, TagExtractionPayload, Tag } from '../../types/api.types'
import { ResultCard } from '../ui/ResultCard'
import { CATEGORY_LABELS } from '../../utils/formatters'

const CATEGORY_COLORS: Record<string, string> = {
  topic: 'bg-purple-100 text-purple-700',
  keyword: 'bg-blue-100 text-blue-700',
  location: 'bg-green-100 text-green-700',
  person: 'bg-orange-100 text-orange-700',
  org: 'bg-pink-100 text-pink-700',
}

interface Props {
  result: JobResult<TagExtractionPayload>
}

export function TagsPanel({ result }: Props) {
  const { tags } = result.payload

  const grouped = tags.reduce<Record<string, Tag[]>>((acc, tag) => {
    const cat = tag.category ?? 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(tag)
    return acc
  }, {})

  return (
    <ResultCard title="關鍵字標籤" icon="🏷️">
      <div className="space-y-3">
        {Object.entries(grouped).map(([category, catTags]) => (
          <div key={category}>
            <p className="text-xs text-gray-400 mb-1.5">
              {CATEGORY_LABELS[category] ?? category}
            </p>
            <div className="flex flex-wrap gap-2">
              {catTags.map((tag, i) => (
                <span
                  key={i}
                  title={tag.confidence_score != null ? `信心度 ${(tag.confidence_score * 100).toFixed(0)}%` : undefined}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[category] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ResultCard>
  )
}
