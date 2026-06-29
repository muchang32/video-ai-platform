import { useEffect, useRef, useState, useCallback } from 'react'
import { useVideoStore } from '../store/videoStore'
import { getBatch, getJobResult, enrichAsset } from '../services/index'
import type {
  TranscriptionPayload, TagExtractionPayload, SummarizationPayload,
  DetectionPayload, MediaPreparationPayload, MetadataFusionPayload, JobResult,
} from '../types/api.types'

export interface VideoResults {
  transcription: JobResult<TranscriptionPayload> | null
  tags: JobResult<TagExtractionPayload> | null
  summary: JobResult<SummarizationPayload> | null
  detection: JobResult<DetectionPayload> | null
  media: JobResult<MediaPreparationPayload> | null
  fusion: JobResult<MetadataFusionPayload> | null
}

const TERMINAL = new Set(['COMPLETED', 'FAILED', 'PARTIAL_SUCCESS'])

export function useVideoDetail(cmsId: string) {
  const { getVideo, updateVideo } = useVideoStore()
  const video = useVideoStore((s) => s.videos.find((v) => v.cmsId === cmsId))

  const [results, setResults] = useState<VideoResults>({
    transcription: null, tags: null, summary: null,
    detection: null, media: null, fusion: null,
  })
  const [isLoadingResults, setIsLoadingResults] = useState(false)
  const [isReanalyzing, setIsReanalyzing] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didFetchRef = useRef(false)

  // Fetch all completed job results
  const fetchResults = useCallback(async (batchId: string) => {
    if (!batchId || didFetchRef.current) return
    setIsLoadingResults(true)
    try {
      const batch = await getBatch(batchId)
      const completed = batch.jobs.filter((j) => j.status === 'COMPLETED')
      const fetched: Partial<VideoResults> = {}

      await Promise.all(completed.map(async (job) => {
        const result = await getJobResult(job.job_id, job.job_type)
        if (!result) return
        switch (job.job_type) {
          case 'METADATA_FUSION':  fetched.fusion       = result as JobResult<MetadataFusionPayload>;  break
          case 'MEDIA_PREPARATION':fetched.media        = result as JobResult<MediaPreparationPayload>; break
          case 'TRANSCRIPTION':    fetched.transcription= result as JobResult<TranscriptionPayload>;    break
          case 'TAG_EXTRACTION':   fetched.tags         = result as JobResult<TagExtractionPayload>;    break
          case 'SUMMARIZATION':    fetched.summary      = result as JobResult<SummarizationPayload>;    break
          case 'DETECTION':        fetched.detection    = result as JobResult<DetectionPayload>;        break
        }
      }))

      setResults((r) => ({ ...r, ...fetched }))

      // Update duration if MEDIA_PREPARATION is available
      const duration = (fetched.media ?? results.media)?.payload.media_duration_s ?? null
      if (duration != null && duration > 0) updateVideo(cmsId, { duration })

      didFetchRef.current = true
    } catch {
      // silently ignore — results may not be available yet
    } finally {
      setIsLoadingResults(false)
    }
  }, [cmsId, updateVideo, results.media])

  // Polling loop
  const pollBatch = useCallback((batchId: string) => {
    const tick = async () => {
      try {
        const batch = await getBatch(batchId)
        const isTerminal = TERMINAL.has(batch.status)

        if (isTerminal) {
          const now = new Date().toISOString()
          updateVideo(cmsId, {
            analysisStatus: batch.status as 'COMPLETED' | 'FAILED' | 'PARTIAL_SUCCESS',
            analysisCompletedAt: now,
            failureReason: batch.status === 'FAILED'
              ? batch.jobs.find((j) => j.status === 'FAILED')?.error_category ?? '分析失敗'
              : null,
          })
          if (batch.status !== 'FAILED') fetchResults(batchId)
        } else {
          pollingRef.current = setTimeout(tick, 3000)
        }
      } catch {
        pollingRef.current = setTimeout(tick, 5000) // longer retry on error
      }
    }
    tick()
  }, [cmsId, updateVideo, fetchResults])

  // Bootstrap: start polling if PROCESSING, or fetch results if already done
  useEffect(() => {
    const v = getVideo(cmsId)
    if (!v?.batchId) return

    if (v.analysisStatus === 'PROCESSING' || v.analysisStatus === 'PENDING') {
      pollBatch(v.batchId)
    } else if (v.analysisStatus === 'COMPLETED' || v.analysisStatus === 'PARTIAL_SUCCESS') {
      fetchResults(v.batchId)
    }

    return () => { if (pollingRef.current) clearTimeout(pollingRef.current) }
  }, [cmsId]) // run once on mount

  // Re-analyze action
  const reanalyze = useCallback(async () => {
    const v = getVideo(cmsId)
    if (!v?.platformId) return
    setIsReanalyzing(true)
    try {
      const enrichResult = await enrichAsset(v.platformId)
      const now = new Date().toISOString()
      updateVideo(cmsId, {
        batchId: enrichResult.batch_id,
        analysisStatus: 'PROCESSING',
        analysisStartedAt: now,
        analysisCompletedAt: null,
        failureReason: null,
      })
      localStorage.setItem(`vap_batch_${cmsId}`, enrichResult.batch_id)
      setResults({ transcription: null, tags: null, summary: null, detection: null, media: null, fusion: null })
      didFetchRef.current = false
      if (pollingRef.current) clearTimeout(pollingRef.current)
      pollBatch(enrichResult.batch_id)
    } finally {
      setIsReanalyzing(false)
    }
  }, [cmsId, getVideo, updateVideo, pollBatch])

  return { video, results, isLoadingResults, isReanalyzing, reanalyze }
}
