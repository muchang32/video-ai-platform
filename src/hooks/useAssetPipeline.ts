import { useCallback, useState } from 'react'
import { useVideoStore } from '../store/videoStore'
import { useUserStore } from '../store/userStore'
import { registerAsset, uploadAsset, enrichAsset } from '../services/index'
import { getVideoFormat } from '../utils/formatters'
import axios from 'axios'

interface UploadState {
  phase: 'idle' | 'uploading' | 'starting' | 'done' | 'error'
  progress: number  // 0-100
  error: string | null
}

export function useAssetPipeline() {
  const videoStore = useVideoStore()
  const { currentUser } = useUserStore()
  const [state, setState] = useState<UploadState>({ phase: 'idle', progress: 0, error: null })

  const startPipeline = useCallback(async (file: File): Promise<string> => {
    if (!currentUser) throw new Error('請先建立使用者帳號')

    setState({ phase: 'uploading', progress: 0, error: null })

    // Derive a filename-based hint for the backend (not user-facing)
    const filenameStem = file.name.replace(/\.[^.]+$/, '')

    try {
      // 1. Register — API returns platform_id which becomes our primary key
      const asset = await registerAsset(filenameStem, currentUser.email)

      // 2. Upload
      if (asset.status !== 'READY') {
        try {
          await uploadAsset(asset.platform_id, file, (pct) =>
            setState((s) => ({ ...s, progress: pct }))
          )
        } catch (e) {
          if (axios.isAxiosError(e) && e.response?.status === 409) {
            // Already uploaded — skip upload step
          } else {
            throw e
          }
        }
      }

      setState((s) => ({ ...s, phase: 'starting', progress: 100 }))

      // 3. Enrich
      const enrichResult = await enrichAsset(asset.platform_id)

      // 4. Save to video library — use platform_id as the canonical identifier
      const now = new Date().toISOString()
      const videoId = asset.platform_id
      videoStore.addVideo({
        cmsId: videoId,
        platformId: videoId,
        batchId: enrichResult.batch_id,
        uploaderId: currentUser.id,
        uploaderName: currentUser.name,
        uploaderEmail: currentUser.email,
        uploadedAt: now,
        fileName: file.name,
        fileFormat: getVideoFormat(file.name),
        fileSize: file.size,
        analysisStatus: 'PROCESSING',
        analysisStartedAt: now,
        analysisCompletedAt: null,
        failureReason: null,
        duration: null,
      })

      // Save batchId to localStorage for polling resume
      localStorage.setItem(`vap_batch_${videoId}`, enrichResult.batch_id)

      setState({ phase: 'done', progress: 100, error: null })
      return videoId
    } catch (e) {
      const msg = getErrorMessage(e)
      setState({ phase: 'error', progress: 0, error: msg })
      throw new Error(msg)
    }
  }, [currentUser, videoStore])

  const reset = useCallback(() => {
    setState({ phase: 'idle', progress: 0, error: null })
  }, [])

  return { state, startPipeline, reset }
}

function getErrorMessage(e: unknown): string {
  if (!axios.isAxiosError(e)) return '發生未知錯誤'
  const status = e.response?.status
  if (status === 413) return '檔案大小超過 2GB 上限'
  if (status === 415) return '請上傳影片檔案（MP4 等）'
  if (status === 503) return '服務暫時無法使用，請稍後重試'
  return e.response?.data?.detail ?? '操作失敗，請稍後重試'
}
