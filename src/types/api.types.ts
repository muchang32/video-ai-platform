export type JobStatus = 'BLOCKED' | 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
export type BatchStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'PARTIAL_SUCCESS' | 'FAILED'
export type AssetStatus = 'SUBMITTED' | 'UPLOADING' | 'READY' | 'PROCESSING' | 'COMPLETED' | 'PARTIAL_SUCCESS' | 'FAILED'

export type JobType =
  | 'MEDIA_PREPARATION'
  | 'TRANSCRIPTION'
  | 'DETECTION'
  | 'TAG_EXTRACTION'
  | 'SUMMARIZATION'
  | 'METADATA_FUSION'

export interface Asset {
  platform_id: string
  external_cms_id: string
  status: AssetStatus
  submitted_at: string
  updated_at: string
}

export interface JobSummary {
  job_id: string
  job_type: JobType
  status: JobStatus
  error_category: string | null
  error_detail: string | null
}

export interface BatchResponse {
  batch_id: string
  status: BatchStatus
  job_count: number
  pending_count: number
  completed_count: number
  failed_count: number
  completed_at: string | null
  jobs: JobSummary[]
}

export interface TranscriptSegment {
  start_seconds: number
  end_seconds: number
  text: string
  confidence_score?: number
  speaker_id?: string
}

export interface TranscriptionPayload {
  language_code: string
  segments: TranscriptSegment[]
}

export interface Tag {
  label: string
  category: string
  confidence_score?: number
  timestamp_seconds?: number
}

export interface TagExtractionPayload {
  tags: Tag[]
}

export interface SummarizationPayload {
  summary_text: string
  language_code: string
  source_result_ids: string[]
}

export interface Detection {
  detection_type: 'scene' | 'object' | 'landmark' | 'text_on_screen' | 'person'
  label: string
  start_seconds: number
  end_seconds: number
  confidence_score?: number
  bounding_box?: null
}

export interface DetectionPayload {
  detections: Detection[]
}

export interface Scene {
  scene_index: number
  start_seconds: number
  end_seconds: number
}

export interface MediaPreparationPayload {
  media_duration_s: number
  scene_count: number
  scenes: Scene[]
}

export interface MetadataFusionPayload {
  fused_fields: {
    transcript?: TranscriptionPayload
    tags?: Tag[]
    detections?: Detection[]
    summary?: string
  }
  source_result_ids: string[]
  fusion_strategy: string
}

export interface JobResult<T> {
  result_id: string
  job_id: string
  asset_platform_id: string
  asset_external_cms_id: string
  job_type: JobType
  result_status: 'COMPLETE' | 'PARTIAL' | 'FAILED' | 'NOT_PRODUCED'
  payload: T
  produced_at: string
  expires_at: string
}
