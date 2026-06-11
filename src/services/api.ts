import axios from 'axios'
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
} from '../types/api.types'

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

export async function registerAsset(externalCmsId: string, registeredBy = 'web-demo'): Promise<Asset> {
  const res = await client.post<Asset>('/assets', {
    external_cms_id: externalCmsId,
    registered_by: registeredBy,
  })
  return res.data
}

export async function uploadAsset(
  platformId: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<Asset> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await client.post<Asset>(`/assets/${platformId}/upload`, formData, {
    timeout: 0,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (e.total) onProgress(Math.round((e.loaded / e.total) * 100))
    },
  })
  return res.data
}

export async function enrichAsset(platformId: string): Promise<{ batch_id: string; status: string }> {
  const res = await client.post(`/assets/${platformId}/enrich`, {})
  return res.data
}

export async function getBatch(batchId: string): Promise<BatchResponse> {
  const res = await client.get<BatchResponse>(`/batches/${batchId}`)
  return res.data
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
  try {
    const res = await client.get<JobResult<JobResultPayloadMap[T]>>(
      `/jobs/${jobId}/results/${jobType}`
    )
    if (res.data.result_status === 'NOT_PRODUCED') return null
    return res.data
  } catch (e: unknown) {
    if (axios.isAxiosError(e) && (e.response?.status === 404 || e.response?.status === 410)) {
      return null
    }
    throw e
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    await client.get('/health', { timeout: 3000 })
    return true
  } catch {
    return false
  }
}
