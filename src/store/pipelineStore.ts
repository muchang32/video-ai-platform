import { create } from 'zustand'
import type {
  JobSummary,
  BatchStatus,
  JobResult,
  JobType,
  TranscriptionPayload,
  TagExtractionPayload,
  SummarizationPayload,
  DetectionPayload,
  MediaPreparationPayload,
  MetadataFusionPayload,
} from '../types/api.types'

type AnyJobResult =
  | JobResult<TranscriptionPayload>
  | JobResult<TagExtractionPayload>
  | JobResult<SummarizationPayload>
  | JobResult<DetectionPayload>
  | JobResult<MediaPreparationPayload>
  | JobResult<MetadataFusionPayload>

interface PipelineState {
  batchId: string | null
  batchStatus: BatchStatus | null
  jobs: JobSummary[]
  results: Partial<Record<JobType, AnyJobResult>>
  uploadProgress: number
  isUploading: boolean
  error: string | null

  setBatchId: (id: string) => void
  setBatchStatus: (status: BatchStatus) => void
  setJobs: (jobs: JobSummary[]) => void
  setResult: (jobType: JobType, result: AnyJobResult) => void
  setUploadProgress: (pct: number) => void
  setIsUploading: (v: boolean) => void
  setError: (msg: string | null) => void
  reset: () => void
}

export const usePipelineStore = create<PipelineState>((set) => ({
  batchId: null,
  batchStatus: null,
  jobs: [],
  results: {},
  uploadProgress: 0,
  isUploading: false,
  error: null,

  setBatchId: (id) => set({ batchId: id }),
  setBatchStatus: (status) => set({ batchStatus: status }),
  setJobs: (jobs) => set({ jobs }),
  setResult: (jobType, result) =>
    set((s) => ({ results: { ...s.results, [jobType]: result } })),
  setUploadProgress: (pct) => set({ uploadProgress: pct }),
  setIsUploading: (v) => set({ isUploading: v }),
  setError: (msg) => set({ error: msg }),
  reset: () =>
    set({
      batchId: null,
      batchStatus: null,
      jobs: [],
      results: {},
      uploadProgress: 0,
      isUploading: false,
      error: null,
    }),
}))
