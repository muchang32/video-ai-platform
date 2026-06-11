import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { UserSelector } from '../ui/UserSelector'
import { UploadModal } from '../upload/UploadModal'
import { LoginGate } from '../auth/LoginGate'
import { useUserStore } from '../../store/userStore'
import { isMockMode } from '../../services/index'

interface Props {
  children: ReactNode
}

export function AppLayout({ children }: Props) {
  const [showUpload, setShowUpload] = useState(false)
  const { currentUser } = useUserStore()

  // Block access until logged in
  if (!currentUser) return <LoginGate />

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#1a3a5c] to-[#1e4d7b] shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl" aria-hidden="true">🎬</span>
            <span className="font-bold text-white text-sm tracking-wide hidden sm:block">
              影片 AI 分析展示平台
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isMockMode && (
              <span className="px-2 py-0.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-medium rounded-full">
                Mock 模式
              </span>
            )}
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-medium rounded-lg transition-colors border border-white/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              上傳影片
            </button>
            <UserSelector />
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Upload Modal */}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  )
}
