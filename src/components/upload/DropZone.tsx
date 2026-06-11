import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'

interface Props {
  onFileSelected: (file: File) => void
  disabled?: boolean
}

const MAX_SIZE = 2 * 1024 * 1024 * 1024 // 2GB

export function DropZone({ onFileSelected, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  function validate(file: File): string | null {
    if (!file.type.startsWith('video/')) return '請上傳影片檔案（MP4 等）'
    if (file.size > MAX_SIZE) return '檔案大小超過 2GB 上限'
    return null
  }

  function handleFile(file: File) {
    const err = validate(file)
    if (err) { setValidationError(err); return }
    setValidationError(null)
    onFileSelected(file)
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`
          relative flex flex-col items-center justify-center gap-3
          border-2 border-dashed rounded-xl p-12 cursor-pointer
          transition-colors duration-200
          ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="text-4xl">🎬</div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">拖放影片至此，或點擊選擇檔案</p>
          <p className="text-xs text-gray-400 mt-1">支援 MP4、MOV、AVI 等影片格式，最大 2GB</p>
        </div>
      </div>
      {validationError && (
        <p className="mt-2 text-sm text-red-600">{validationError}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  )
}
