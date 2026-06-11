import { create } from 'zustand'

export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIAL_SUCCESS'

export interface VideoRecord {
  cmsId: string
  platformId: string
  batchId: string | null
  uploaderId: string
  uploaderName: string
  uploaderEmail: string
  uploadedAt: string       // ISO string
  fileName: string
  fileFormat: string       // 'MP4', 'MOV', etc.
  fileSize: number         // bytes
  analysisStatus: AnalysisStatus
  analysisStartedAt: string | null
  analysisCompletedAt: string | null
  failureReason: string | null
  duration: number | null  // seconds, filled in after MEDIA_PREPARATION
}

const STORAGE_KEY = 'vap_videos'

function load(): VideoRecord[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}

function save(videos: VideoRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(videos))
}

interface VideoStore {
  videos: VideoRecord[]
  addVideo: (video: VideoRecord) => void
  updateVideo: (cmsId: string, updates: Partial<VideoRecord>) => void
  removeVideo: (cmsId: string) => void
  getVideo: (cmsId: string) => VideoRecord | undefined
}

export const useVideoStore = create<VideoStore>((set, get) => ({
  videos: load(),

  addVideo: (video) => {
    // Replace if CMS ID already exists
    const existing = get().videos.filter((v) => v.cmsId !== video.cmsId)
    const videos = [video, ...existing]
    save(videos)
    set({ videos })
  },

  updateVideo: (cmsId, updates) => {
    const videos = get().videos.map((v) =>
      v.cmsId === cmsId ? { ...v, ...updates } : v
    )
    save(videos)
    set({ videos })
  },

  removeVideo: (cmsId) => {
    const videos = get().videos.filter((v) => v.cmsId !== cmsId)
    save(videos)
    // Clean up related localStorage keys
    localStorage.removeItem(`vap_batch_${cmsId}`)
    set({ videos })
  },

  getVideo: (cmsId) => get().videos.find((v) => v.cmsId === cmsId),
}))
