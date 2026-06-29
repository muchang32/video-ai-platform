import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useVideoStore, type VideoRecord } from '../store/videoStore'
import {
  ANALYSIS_STATUS_CONFIG,
  formatRelativeTime,
  formatFileSize,
  formatDuration,
} from '../utils/formatters'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export function LibraryPage() {
  const { videos } = useVideoStore()

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="text-6xl mb-4" aria-hidden="true">🎬</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">影片庫是空的</h2>
        <p className="text-gray-400 text-sm mb-6">點擊右上角「上傳影片」來開始分析</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          影片庫
          <span className="ml-2 text-sm font-normal text-gray-400">{videos.length} 部影片</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {videos.map((video) => (
          <VideoCard key={video.cmsId} video={video} />
        ))}
      </div>
    </div>
  )
}

function VideoCard({ video }: { video: VideoRecord }) {
  const { removeVideo } = useVideoStore()
  const status = ANALYSIS_STATUS_CONFIG[video.analysisStatus]
  const isProcessing = video.analysisStatus === 'PROCESSING' || video.analysisStatus === 'PENDING'
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden">
      {/* Clickable area → navigates to detail */}
      <Link to={`/videos/${encodeURIComponent(video.cmsId)}`} className="block group">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-900 overflow-hidden">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-14 h-14 text-white/20 group-hover:text-white/30 transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
          {video.duration != null && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-mono">
              {formatDuration(video.duration)}
            </div>
          )}
          <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded font-mono">
            {video.fileFormat}
          </div>
          <div className="absolute top-2 right-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.pill}`}>
              {isProcessing && <LoadingSpinner size="sm" className="!w-3 !h-3" />}
              {status.label}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="px-4 pt-4 pb-2">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {video.fileName.replace(/\.[^.]+$/, '')}
          </h3>
          <p className="text-xs text-gray-400 font-mono truncate mb-2">{video.cmsId}</p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0" aria-hidden="true">
              {video.uploaderName.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <span className="font-medium text-gray-600">{video.uploaderName}</span>
              <span className="ml-1 truncate hidden sm:inline">{video.uploaderEmail}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Bottom row: outside Link so delete doesn't trigger navigation */}
      <div className="px-4 pb-4 pt-2">
        {confirming ? (
          <div className="flex items-center justify-between gap-2 py-1.5 px-2 bg-red-50 rounded-lg border border-red-100">
            <span className="text-xs text-red-600 font-medium">確定要刪除此影片？</span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => removeVideo(video.cmsId)}
                className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded transition-colors font-medium"
              >
                刪除
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-0.5 rounded hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{formatRelativeTime(video.uploadedAt)}</span>
            <div className="flex items-center gap-2">
              <span>{formatFileSize(video.fileSize)}</span>
              <button
                onClick={() => setConfirming(true)}
                className="p-1 rounded text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                aria-label="刪除影片"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
