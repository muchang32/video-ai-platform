import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { DropZone } from './DropZone'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { usePipelineStore } from '../../store/pipelineStore'
import { useAssetPipeline } from '../../hooks/useAssetPipeline'
import { useUserStore } from '../../store/userStore'

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { startPipeline } = useAssetPipeline()
  const { uploadProgress } = usePipelineStore()
  const { currentUser } = useUserStore()

  function onFileSelected(f: File) {
    setFile(f)
    setSubmitError(null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file || isSubmitting) return
    if (!currentUser) {
      setSubmitError('請先在右上角建立使用者帳號')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const videoId = await startPipeline(file)
      navigate(`/videos/${encodeURIComponent(videoId)}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '上傳失敗')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <DropZone onFileSelected={onFileSelected} disabled={isSubmitting} />

      {file && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg text-sm text-blue-700">
          <span>📄</span>
          <span className="font-medium truncate">{file.name}</span>
          <span className="text-blue-400 ml-auto whitespace-nowrap">
            {(file.size / 1024 / 1024).toFixed(1)} MB
          </span>
        </div>
      )}

      {/* Uploader info */}
      <div className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-400 mb-0.5">上傳者</p>
        {currentUser ? (
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {currentUser.name.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <span className="text-sm font-medium text-gray-800">{currentUser.name}</span>
              <span className="ml-2 text-xs font-mono text-gray-400">{currentUser.id}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-orange-600">
            尚未設定使用者，請點右上角{' '}
            <Link to="#" className="font-medium underline" onClick={(e) => e.preventDefault()}>
              建立帳號
            </Link>
          </p>
        )}
      </div>

      {isSubmitting && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{uploadProgress < 100 ? '上傳中...' : '啟動 AI 分析...'}</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {submitError && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={!file || isSubmitting}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" />
            {uploadProgress < 100 ? '上傳中...' : '啟動分析...'}
          </>
        ) : (
          '開始上傳並分析'
        )}
      </button>
    </form>
  )
}
