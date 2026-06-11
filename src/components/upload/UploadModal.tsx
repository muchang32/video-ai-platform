import { useState, type FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DropZone } from './DropZone'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { useAssetPipeline } from '../../hooks/useAssetPipeline'
import { useUserStore } from '../../store/userStore'

interface Props {
  onClose: () => void
}

export function UploadModal({ onClose }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const navigate = useNavigate()
  const { state, startPipeline, reset } = useAssetPipeline()
  const { currentUser } = useUserStore()

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function onFileSelected(f: File) {
    setFile(f)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file || state.phase === 'uploading' || state.phase === 'starting') return
    try {
      const videoId = await startPipeline(file)
      onClose()
      navigate(`/videos/${encodeURIComponent(videoId)}`)
    } catch {
      // error shown in state.error
    }
  }

  const isSubmitting = state.phase === 'uploading' || state.phase === 'starting'

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="上傳影片"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">上傳影片</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="關閉"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <DropZone onFileSelected={onFileSelected} disabled={isSubmitting} />

          {file && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg text-sm text-blue-700">
              <span aria-hidden="true">📄</span>
              <span className="font-medium truncate">{file.name}</span>
              <span className="text-blue-400 ml-auto whitespace-nowrap shrink-0">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
          )}

          {/* Uploader */}
          <div className="px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-400 mb-0.5">上傳者</p>
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0" aria-hidden="true">
                  {currentUser.name.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <span className="text-sm font-medium text-gray-800">{currentUser.name}</span>
                  <span className="ml-2 text-xs text-gray-400">{currentUser.email}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-orange-600">請先在右上角建立使用者帳號</p>
            )}
          </div>

          {/* Progress */}
          {isSubmitting && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>{state.phase === 'uploading' ? '上傳中...' : '啟動分析...'}</span>
                {state.phase === 'uploading' && <span>{state.progress}%</span>}
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: state.phase === 'starting' ? '100%' : `${state.progress}%` }}
                />
              </div>
            </div>
          )}

          {state.error && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 rounded-lg text-sm text-red-700">
              <span aria-hidden="true">⚠️</span>
              <div>
                <p>{state.error}</p>
                <button type="button" onClick={reset} className="mt-1 text-xs underline text-red-500">
                  重試
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || !currentUser || isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                {state.phase === 'uploading' ? '上傳中...' : '啟動分析...'}
              </>
            ) : '開始上傳並分析'}
          </button>
        </form>
      </div>
    </div>
  )
}
