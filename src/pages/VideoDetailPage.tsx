import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useVideoDetail } from '../hooks/useVideoDetail'
import { useVideoStore } from '../store/videoStore'
import {
  ANALYSIS_STATUS_CONFIG,
  formatDateTime,
  formatFileSize,
  formatDuration,
  CATEGORY_LABELS,
  DETECTION_TYPE_LABELS,
  formatSeconds,
  ERROR_CATEGORY_LABELS,
} from '../utils/formatters'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import type {
  TranscriptionPayload, TagExtractionPayload, SummarizationPayload,
  DetectionPayload, Tag, Detection,
} from '../types/api.types'

type Tab = 'transcript' | 'info'

export function VideoDetailPage() {
  const { cmsId } = useParams<{ cmsId: string }>()
  const decodedCmsId = cmsId ? decodeURIComponent(cmsId) : ''
  const [activeTab, setActiveTab] = useState<Tab>('transcript')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const { video, results, isLoadingResults, isReanalyzing, reanalyze } = useVideoDetail(decodedCmsId)
  const { removeVideo } = useVideoStore()
  const navigate = useNavigate()

  function handleDelete() {
    removeVideo(decodedCmsId)
    navigate('/')
  }

  if (!video) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-400 mb-4">找不到此影片記錄</p>
        <Link to="/" className="text-blue-600 hover:underline text-sm">← 返回影片庫</Link>
      </div>
    )
  }

  const statusConfig = ANALYSIS_STATUS_CONFIG[video.analysisStatus]
  const isProcessing = video.analysisStatus === 'PROCESSING' || video.analysisStatus === 'PENDING'

  // Resolve display data from individual job results
  // (METADATA_FUSION returns aggregated summaries, not full payloads)
  const transcript = results.transcription?.payload as TranscriptionPayload | undefined
  const tags = (results.tags?.payload as TagExtractionPayload | undefined)?.tags ?? []
  const summary = (results.summary?.payload as SummarizationPayload | undefined)?.summary_text
  const detections = (results.detection?.payload as DetectionPayload | undefined)?.detections ?? []
  const mediaDurationRaw = results.media?.payload.media_duration_s
  const mediaDuration = (mediaDurationRaw != null && mediaDurationRaw > 0) ? mediaDurationRaw : video.duration

  const hasTranscript = transcript && transcript.segments.length > 0
  const hasInfo = summary || tags.length > 0 || detections.length > 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-600 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        影片庫
      </Link>

      {/* Top section: thumbnail + info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Thumbnail */}
          <div className="sm:w-2/5 bg-gray-900 relative aspect-video sm:aspect-auto flex items-center justify-center">
            <svg className="w-20 h-20 text-white/20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
            {mediaDuration != null && (
              <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-0.5 rounded font-mono">
                {formatDuration(mediaDuration)}
              </span>
            )}
          </div>

          {/* Metadata */}
          <div className="sm:w-3/5 p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 truncate">
                  {video.fileName.replace(/\.[^.]+$/, '')}
                </h1>
                <p className="text-xs text-gray-400 font-mono mt-0.5">ID：{video.cmsId}</p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {/* Analysis status pill */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.pill}`}>
                  {isProcessing && <LoadingSpinner size="sm" />}
                  {statusConfig.label}
                </span>
                {/* Delete button */}
                {confirmingDelete ? (
                  <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                    <span className="text-xs text-red-600 font-medium whitespace-nowrap">確定刪除？</span>
                    <button
                      onClick={handleDelete}
                      className="text-xs text-white bg-red-500 hover:bg-red-600 px-1.5 py-0.5 rounded transition-colors font-medium"
                    >
                      刪除
                    </button>
                    <button
                      onClick={() => setConfirmingDelete(false)}
                      className="text-xs text-gray-500 hover:text-gray-700 px-1.5 py-0.5 rounded hover:bg-gray-100 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmingDelete(true)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="刪除影片"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Failure reason */}
            {video.failureReason && (
              <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                失敗原因：{ERROR_CATEGORY_LABELS[video.failureReason ?? ''] ?? video.failureReason}
              </div>
            )}

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <InfoRow label="上傳者" value={`${video.uploaderName}`} />
              <InfoRow label="上傳者 Email" value={video.uploaderEmail ?? video.uploaderId} />
              <InfoRow label="上傳時間" value={formatDateTime(video.uploadedAt)} />
              <InfoRow label="影片格式" value={video.fileFormat} />
              <InfoRow label="檔案大小" value={formatFileSize(video.fileSize)} />
              {mediaDuration != null && <InfoRow label="影片時長" value={formatDuration(mediaDuration)} />}
              {video.analysisStartedAt && <InfoRow label="分析開始" value={formatDateTime(video.analysisStartedAt)} />}
              {video.analysisCompletedAt && <InfoRow label="分析完成" value={formatDateTime(video.analysisCompletedAt)} />}
            </dl>
          </div>
        </div>
      </div>

      {/* Tabs section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center border-b border-gray-100 px-1">
          <TabButton active={activeTab === 'transcript'} onClick={() => setActiveTab('transcript')}>
            逐字稿
          </TabButton>
          <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')}>
            影片資訊
          </TabButton>

          {/* Re-analyze button — far right */}
          <div className="ml-auto pr-3">
            <button
              onClick={reanalyze}
              disabled={isProcessing || isReanalyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isReanalyzing ? <LoadingSpinner size="sm" /> : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              重新分析
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="p-5">
          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <LoadingSpinner size="lg" />
              <p className="text-sm">AI 分析進行中，請稍候...</p>
            </div>
          )}

          {!isProcessing && isLoadingResults && (
            <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
              <LoadingSpinner size="sm" />
              <span className="text-sm">載入結果中...</span>
            </div>
          )}

          {!isProcessing && !isLoadingResults && activeTab === 'transcript' && (
            hasTranscript ? (
              <TranscriptView transcript={transcript!} />
            ) : (
              <EmptyPanel message={
                video.analysisStatus === 'FAILED' ? '分析失敗，無法取得逐字稿' :
                video.analysisStatus === 'COMPLETED' ? '此影片沒有可用的逐字稿' :
                '分析完成後可查看逐字稿'
              } />
            )
          )}

          {!isProcessing && !isLoadingResults && activeTab === 'info' && (
            hasInfo ? (
              <InfoTabView summary={summary} tags={tags} detections={detections} />
            ) : (
              <EmptyPanel message={
                video.analysisStatus === 'FAILED' ? '分析失敗，無法取得影片資訊' :
                video.analysisStatus === 'COMPLETED' ? '此影片沒有可用的分析結果' :
                '分析完成後可查看影片資訊'
              } />
            )
          )}
        </div>
      </div>
    </div>
  )
}

// --- Sub-components ---

function TabButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="text-gray-800 font-medium mt-0.5 truncate" title={value}>{value}</dd>
    </div>
  )
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
      {message}
    </div>
  )
}

function TranscriptView({ transcript }: { transcript: TranscriptionPayload }) {
  return (
    <div className="max-h-[480px] overflow-y-auto space-y-1 pr-1">
      {transcript.segments.map((seg, i) => (
        <div key={i} className="flex gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors">
          <span className="shrink-0 text-xs text-blue-500 font-mono pt-0.5 w-28">
            [{formatSeconds(seg.start_seconds)} - {formatSeconds(seg.end_seconds)}]
          </span>
          <div className="flex-1 min-w-0">
            {seg.speaker_id && (
              <span className="text-xs text-gray-400 mr-1">{seg.speaker_id}</span>
            )}
            <span className="text-sm text-gray-800">{seg.text}</span>
          </div>
          {seg.confidence_score != null && (
            <span className="shrink-0 text-xs text-gray-300">{(seg.confidence_score * 100).toFixed(0)}%</span>
          )}
        </div>
      ))}
    </div>
  )
}

const CATEGORY_COLORS: Record<string, string> = {
  topic: 'bg-purple-100 text-purple-700',
  keyword: 'bg-blue-100 text-blue-700',
  location: 'bg-green-100 text-green-700',
  person: 'bg-orange-100 text-orange-700',
  org: 'bg-pink-100 text-pink-700',
}

function InfoTabView({
  summary, tags, detections,
}: {
  summary?: string
  tags: Tag[]
  detections: Detection[]
}) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      {summary && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">摘要</h3>
          <blockquote className="border-l-4 border-blue-300 pl-4 text-gray-700 leading-relaxed">
            {summary}
          </blockquote>
        </section>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">關鍵字標籤</h3>
          {(() => {
            const grouped = tags.reduce<Record<string, Tag[]>>((acc, t) => {
              const cat = t.category ?? 'other'
              acc[cat] = [...(acc[cat] ?? []), t]
              return acc
            }, {})
            return (
              <div className="space-y-3">
                {Object.entries(grouped).map(([cat, catTags]) => (
                  <div key={cat}>
                    <p className="text-xs text-gray-400 mb-1.5">{CATEGORY_LABELS[cat] ?? cat}</p>
                    <div className="flex flex-wrap gap-2">
                      {catTags.map((tag, i) => (
                        <span
                          key={i}
                          title={tag.confidence_score != null ? `信心度 ${(tag.confidence_score * 100).toFixed(0)}%` : undefined}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[cat] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </section>
      )}

      {/* Detection */}
      {detections.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">影像分析</h3>
          <div className="divide-y divide-gray-100">
            {detections.map((det, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 gap-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                    {DETECTION_TYPE_LABELS[det.detection_type] ?? det.detection_type}
                  </span>
                  <span className="text-sm text-gray-800">{det.label}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
                  {det.start_seconds != null && det.end_seconds != null && (
                    <span className="font-mono">{formatSeconds(det.start_seconds)} - {formatSeconds(det.end_seconds)}</span>
                  )}
                  {det.confidence_score != null && <span>{(det.confidence_score * 100).toFixed(0)}%</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
