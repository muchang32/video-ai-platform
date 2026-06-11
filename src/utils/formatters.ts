import type { JobType, JobStatus, BatchStatus } from '../types/api.types'
import type { AnalysisStatus } from '../store/videoStore'

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return '剛剛'
  if (minutes < 60) return `${minutes} 分鐘前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小時前`
  const days = Math.floor(hours / 24)
  return `${days} 天前`
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

export function getVideoFormat(fileName: string): string {
  return fileName.split('.').pop()?.toUpperCase() ?? '未知'
}

export const ANALYSIS_STATUS_CONFIG: Record<AnalysisStatus, { label: string; pill: string; icon: string }> = {
  PENDING:        { label: '等待分析', pill: 'bg-gray-100 text-gray-600',    icon: '⏳' },
  PROCESSING:     { label: '分析中',   pill: 'bg-blue-100 text-blue-700',    icon: '🔄' },
  COMPLETED:      { label: '分析完成', pill: 'bg-green-100 text-green-700',  icon: '✅' },
  PARTIAL_SUCCESS:{ label: '部分完成', pill: 'bg-orange-100 text-orange-700',icon: '⚠️' },
  FAILED:         { label: '分析失敗', pill: 'bg-red-100 text-red-700',      icon: '❌' },
}

export function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  if (m === 0) return `${s} 秒`
  return `${m} 分 ${s} 秒`
}

export const JOB_LABELS: Record<JobType, string> = {
  MEDIA_PREPARATION: '影片解析',
  TRANSCRIPTION: '語音轉文字',
  DETECTION: '影像偵測',
  TAG_EXTRACTION: '關鍵字萃取',
  SUMMARIZATION: '摘要生成',
  METADATA_FUSION: '結果整合',
}

export const CATEGORY_LABELS: Record<string, string> = {
  topic: '主題',
  keyword: '關鍵詞',
  location: '地名',
  person: '人名',
  org: '組織',
}

export const DETECTION_TYPE_LABELS: Record<string, string> = {
  scene: '場景',
  object: '物件',
  landmark: '地標',
  text_on_screen: '畫面文字',
  person: '人物',
}

export const ERROR_CATEGORY_LABELS: Record<string, string> = {
  INVALID_INPUT: '輸入資料有誤',
  PERMANENT_FAILURE: '處理失敗',
  TRANSIENT_FAILURE: '暫時性錯誤，可重試',
  RESOURCE_NOT_FOUND: '找不到相關資源',
  EXTERNAL_DEPENDENCY_FAILURE: '外部服務異常',
  PREREQUISITE_FAILED: '前置步驟失敗',
  UNKNOWN: '未知錯誤',
}

export const JOB_STATUS_CONFIG: Record<JobStatus, { label: string; className: string }> = {
  BLOCKED: { label: '等待中', className: 'bg-gray-100 text-gray-500' },
  PENDING: { label: '排隊中', className: 'bg-blue-100 text-blue-600' },
  RUNNING: { label: '處理中', className: 'bg-blue-100 text-blue-600' },
  COMPLETED: { label: '完成', className: 'bg-green-100 text-green-700' },
  FAILED: { label: '失敗', className: 'bg-red-100 text-red-600' },
  CANCELLED: { label: '已取消', className: 'bg-gray-100 text-gray-500' },
}

export const BATCH_STATUS_CONFIG: Record<BatchStatus, { label: string; className: string }> = {
  PENDING: { label: '等待中', className: 'text-blue-600' },
  PROCESSING: { label: '分析中', className: 'text-blue-600' },
  COMPLETED: { label: '分析完成', className: 'text-green-600' },
  PARTIAL_SUCCESS: { label: '部分完成', className: 'text-orange-600' },
  FAILED: { label: '分析失敗', className: 'text-red-600' },
}
