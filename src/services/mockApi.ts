/**
 * Mock API — simulates the full pipeline without a real backend.
 * Enabled when VITE_MOCK_API=true in .env.local
 *
 * Timeline (elapsed seconds from enrichAsset call):
 *  0s  → all jobs BLOCKED/PENDING
 *  4s  → MEDIA_PREPARATION COMPLETED
 *  8s  → TRANSCRIPTION COMPLETED
 *  12s → DETECTION COMPLETED
 *  16s → TAG_EXTRACTION COMPLETED
 *  20s → SUMMARIZATION COMPLETED
 *  24s → METADATA_FUSION COMPLETED → batch COMPLETED
 */

import type {
  Asset,
  BatchResponse,
  JobResult,
  JobType,
  TranscriptionPayload,
  TagExtractionPayload,
  SummarizationPayload,
  DetectionPayload,
  MediaPreparationPayload,
  MetadataFusionPayload,
  JobStatus,
} from '../types/api.types'

// --- In-memory + localStorage state (survives page reload) ---
interface MockBatch {
  batchId: string
  platformId: string
  cmsId: string
  startedAt: number
  jobs: Array<{ job_id: string; job_type: JobType }>
}

const BATCHES_KEY = 'vap_mock_batches'

function persistBatch(batch: MockBatch) {
  try {
    const all = JSON.parse(localStorage.getItem(BATCHES_KEY) ?? '{}')
    all[batch.batchId] = batch
    localStorage.setItem(BATCHES_KEY, JSON.stringify(all))
  } catch {}
}

function loadBatch(batchId: string): MockBatch | null {
  try {
    const all = JSON.parse(localStorage.getItem(BATCHES_KEY) ?? '{}')
    return all[batchId] ?? null
  } catch { return null }
}

const batches = new Map<string, MockBatch>()
const batchByCmsId = new Map<string, string>() // cmsId → batchId

const JOB_ORDER: JobType[] = [
  'MEDIA_PREPARATION',
  'TRANSCRIPTION',
  'DETECTION',
  'TAG_EXTRACTION',
  'SUMMARIZATION',
  'METADATA_FUSION',
]

const JOB_INTERVAL_MS = 4000 // each job completes every 4s

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

function makeId() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10)
}

// --- API implementations ---

export async function registerAsset(
  externalCmsId: string,
  _registeredBy?: string
): Promise<Asset> {
  await delay(300)
  return {
    platform_id: `plat_${makeId()}`,
    external_cms_id: externalCmsId,
    status: 'SUBMITTED',
    submitted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export async function uploadAsset(
  platformId: string,
  _file: File,
  onProgress: (pct: number) => void
): Promise<Asset> {
  // Simulate upload progress over ~2 seconds
  for (let pct = 10; pct <= 100; pct += 10) {
    await delay(200)
    onProgress(pct)
  }
  return {
    platform_id: platformId,
    external_cms_id: 'mock',
    status: 'READY',
    submitted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export async function enrichAsset(
  platformId: string
): Promise<{ batch_id: string; status: string }> {
  await delay(400)
  const batchId = `batch_${makeId()}`
  const jobs = JOB_ORDER.map((jt) => ({ job_id: `job_${makeId()}`, job_type: jt }))
  const batch: MockBatch = { batchId, platformId, cmsId: platformId, startedAt: Date.now(), jobs }
  batches.set(batchId, batch)
  persistBatch(batch)
  batchByCmsId.set(platformId, batchId)
  return { batch_id: batchId, status: 'PENDING' }
}

export async function getBatch(batchId: string): Promise<BatchResponse> {
  await delay(200)
  // Restore from localStorage if not in memory (e.g. after page reload)
  let batch = batches.get(batchId)
  if (!batch) {
    const stored = loadBatch(batchId)
    if (!stored) throw new Error(`Mock batch ${batchId} not found`)
    batches.set(batchId, stored)
    batch = stored
  }

  const elapsed = Date.now() - batch.startedAt
  const completedCount = Math.min(
    Math.floor(elapsed / JOB_INTERVAL_MS),
    JOB_ORDER.length
  )

  const jobs = batch.jobs.map((j, i) => ({
    job_id: j.job_id,
    job_type: j.job_type,
    status: (i < completedCount ? 'COMPLETED' : i === completedCount ? 'PENDING' : 'BLOCKED') as JobStatus,
    error_category: null,
    error_detail: null,
  }))

  const isAllDone = completedCount >= JOB_ORDER.length
  const batchStatus = isAllDone ? 'COMPLETED' : completedCount > 0 ? 'PROCESSING' : 'PENDING'

  return {
    batch_id: batchId,
    status: batchStatus,
    job_count: JOB_ORDER.length,
    pending_count: Math.max(0, JOB_ORDER.length - completedCount),
    completed_count: completedCount,
    failed_count: 0,
    completed_at: isAllDone ? new Date().toISOString() : null,
    jobs,
  }
}

// --- Mock results per job type ---

const MOCK_TRANSCRIPTION: TranscriptionPayload = {
  language_code: 'zh-TW',
  segments: [
    { start_seconds: 0.0, end_seconds: 5.2, text: '各位觀眾大家好，歡迎收看今日新聞。', confidence_score: 0.96, speaker_id: 'SPEAKER_00' },
    { start_seconds: 5.2, end_seconds: 11.8, text: '今天的頭條新聞，臺灣選舉委員會公佈最新選情。', confidence_score: 0.93, speaker_id: 'SPEAKER_00' },
    { start_seconds: 11.8, end_seconds: 18.4, text: '根據最新民調，執政黨與在野黨的差距持續縮小。', confidence_score: 0.91, speaker_id: 'SPEAKER_00' },
    { start_seconds: 18.4, end_seconds: 25.0, text: '我們現在連線到台北市的記者，請她為我們報告現場狀況。', confidence_score: 0.88, speaker_id: 'SPEAKER_00' },
    { start_seconds: 25.0, end_seconds: 34.6, text: '謝謝主播，我現在站在選委會外面，現場有許多支持者聚集。', confidence_score: 0.92, speaker_id: 'SPEAKER_01' },
    { start_seconds: 34.6, end_seconds: 42.1, text: '候選人剛才發表聲明，表示對選舉結果充滿信心。', confidence_score: 0.89, speaker_id: 'SPEAKER_01' },
  ],
}

const MOCK_TAGS: TagExtractionPayload = {
  tags: [
    { label: '選舉', category: 'topic', confidence_score: 0.95 },
    { label: '政治', category: 'topic', confidence_score: 0.91 },
    { label: '民主', category: 'topic', confidence_score: 0.87 },
    { label: '選委會', category: 'org', confidence_score: 0.93 },
    { label: '執政黨', category: 'org' },
    { label: '在野黨', category: 'org', confidence_score: 0.82 },
    { label: '臺灣', category: 'location', confidence_score: 0.98 },
    { label: '台北市', category: 'location', confidence_score: 0.95 },
    { label: '民調', category: 'keyword', confidence_score: 0.88 },
    { label: '候選人', category: 'keyword', confidence_score: 0.85 },
  ],
}

const MOCK_SUMMARY: SummarizationPayload = {
  summary_text:
    '本影片報導臺灣最新選舉動態。選舉委員會公佈最新選情，顯示執政黨與在野黨之間的差距持續縮小。現場記者從台北市選委會外報導，現場聚集了大批支持者，候選人隨後發表聲明，對選舉結果表達信心。整體選情仍在持續發展中。',
  language_code: 'zh-TW',
  source_result_ids: ['mock-transcription-result-id'],
}

const MOCK_DETECTION: DetectionPayload = {
  detections: [
    { detection_type: 'person', label: '記者', start_seconds: 0.0, end_seconds: 42.1, confidence_score: 0.94 },
    { detection_type: 'person', label: '主播', start_seconds: 0.0, end_seconds: 25.0, confidence_score: 0.92 },
    { detection_type: 'text_on_screen', label: '選舉委員會', start_seconds: 2.5, end_seconds: 11.8, confidence_score: 0.89 },
    { detection_type: 'text_on_screen', label: 'UDN NEWS', start_seconds: 0.0, end_seconds: 42.1 },
    { detection_type: 'landmark', label: '台北市政府', start_seconds: 25.0, end_seconds: 42.1, confidence_score: 0.81 },
    { detection_type: 'object', label: '麥克風', start_seconds: 25.0, end_seconds: 42.1, confidence_score: 0.77 },
  ],
}

const MOCK_MEDIA: MediaPreparationPayload = {
  media_duration_s: 42.1,
  scene_count: 4,
  scenes: [
    { scene_index: 0, start_seconds: 0.0, end_seconds: 11.8 },
    { scene_index: 1, start_seconds: 11.8, end_seconds: 25.0 },
    { scene_index: 2, start_seconds: 25.0, end_seconds: 34.6 },
    { scene_index: 3, start_seconds: 34.6, end_seconds: 42.1 },
  ],
}

const MOCK_FUSION: MetadataFusionPayload = {
  fused_fields: {
    transcript: MOCK_TRANSCRIPTION,
    tags: MOCK_TAGS.tags,
    detections: MOCK_DETECTION.detections,
    summary: MOCK_SUMMARY.summary_text,
  },
  source_result_ids: ['mock-media-id', 'mock-transcription-id', 'mock-tag-id', 'mock-summary-id', 'mock-detection-id'],
  fusion_strategy: 'default',
}

const MOCK_PAYLOADS: Record<JobType, unknown> = {
  MEDIA_PREPARATION: MOCK_MEDIA,
  TRANSCRIPTION: MOCK_TRANSCRIPTION,
  DETECTION: MOCK_DETECTION,
  TAG_EXTRACTION: MOCK_TAGS,
  SUMMARIZATION: MOCK_SUMMARY,
  METADATA_FUSION: MOCK_FUSION,
}

type JobResultPayloadMap = {
  TRANSCRIPTION: TranscriptionPayload
  TAG_EXTRACTION: TagExtractionPayload
  SUMMARIZATION: SummarizationPayload
  DETECTION: DetectionPayload
  MEDIA_PREPARATION: MediaPreparationPayload
  METADATA_FUSION: MetadataFusionPayload
}

export async function getJobResult<T extends JobType>(
  jobId: string,
  jobType: T
): Promise<JobResult<JobResultPayloadMap[T]> | null> {
  await delay(200)
  const payload = MOCK_PAYLOADS[jobType]
  if (!payload) return null

  return {
    result_id: `result_${makeId()}`,
    job_id: jobId,
    asset_platform_id: 'mock-platform-id',
    asset_external_cms_id: 'mock',
    job_type: jobType,
    result_status: 'COMPLETE',
    payload: payload as JobResultPayloadMap[T],
    produced_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 86400_000).toISOString(),
  }
}

export async function checkHealth(): Promise<boolean> {
  return true
}
