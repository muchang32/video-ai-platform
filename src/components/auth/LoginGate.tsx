import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore, isCompanyEmail } from '../../store/userStore'
import { isMockMode } from '../../services/index'

const DOMAIN = '@udngroup.com'

export function LoginGate() {
  const { users, selectUser } = useUserStore()
  const navigate = useNavigate()
  const [view, setView] = useState<'pick' | 'create'>(users.length === 0 ? 'create' : 'pick')

  function onLogin(id: string) {
    selectUser(id)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f2744] via-[#1a3a5c] to-[#1e4d7b] p-4">
      {/* Branding */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3" aria-hidden="true">🎬</div>
        <h1 className="text-2xl font-bold text-white">影片 AI 分析展示平台</h1>
        {isMockMode && (
          <span className="mt-2 inline-block px-2 py-0.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-medium rounded-full">
            Mock 模式
          </span>
        )}
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Card header — only shown in pick view */}
        {view === 'pick' && (
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">選擇帳號</h2>
            <button
              onClick={() => setView('create')}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              + 新增帳號
            </button>
          </div>
        )}

        {/* Back button for create view */}
        {view === 'create' && users.length > 0 && (
          <div className="px-6 pt-5">
            <button
              onClick={() => setView('pick')}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </button>
          </div>
        )}

        {/* Card body */}
        <div className="px-6 py-5">
          {view === 'pick' ? (
            <AccountPicker
              users={users}
              onSelect={onLogin}
              onCreateNew={() => setView('create')}
            />
          ) : (
            <CreateAccountForm onCreated={() => navigate('/')} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <p className="text-center text-xs text-gray-400">
            僅限 <span className="font-medium text-gray-600">{DOMAIN}</span> 帳號使用
          </p>
        </div>
      </div>
    </div>
  )
}

// --- Sub-components ---

import type { User } from '../../store/userStore'

function AccountPicker({
  users,
  onSelect,
}: {
  users: User[]
  onSelect: (id: string) => void
  onCreateNew: () => void
}) {
  return (
    <div className="space-y-2">
      {users.map((u) => (
        <button
          key={u.id}
          onClick={() => onSelect(u.id)}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
        >
          <span className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0" aria-hidden="true">
            {u.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{u.name}</p>
            <p className="text-xs text-gray-400 truncate">{u.email}</p>
          </div>
          <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 ml-auto shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ))}
    </div>
  )
}

function CreateAccountForm({ onCreated }: { onCreated: () => void }) {
  const { createUser } = useUserStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [emailHint, setEmailHint] = useState<'valid' | 'invalid' | null>(null)

  function onEmailChange(val: string) {
    setEmail(val)
    if (val.includes('@')) {
      setEmailHint(isCompanyEmail(val) ? 'valid' : 'invalid')
    } else {
      setEmailHint(null)
    }
    setError(null)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const result = createUser(name, email)
    if ('error' in result) {
      setError(result.error)
    } else {
      onCreated()
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="login-name" className="block text-sm font-medium text-gray-700 mb-1">
          使用者名稱
        </label>
        <input
          id="login-name"
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(null) }}
          placeholder="例：小明、John"
          maxLength={30}
          autoComplete="name"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
          公司 Email
        </label>
        <div className="relative">
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder={`yourname${DOMAIN}`}
            autoComplete="email"
            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8 ${
              emailHint === 'invalid'
                ? 'border-red-300 bg-red-50'
                : emailHint === 'valid'
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300'
            }`}
          />
          {emailHint === 'valid' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-base" aria-label="Email 格式正確">✓</span>
          )}
          {emailHint === 'invalid' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-base" aria-label="Email 格式錯誤">✗</span>
          )}
        </div>
        {emailHint === 'invalid' && (
          <p className="mt-1 text-xs text-red-500">必須使用 {DOMAIN} 信箱</p>
        )}
      </div>

      {error && (
        <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!name.trim() || emailHint === 'invalid' || !email.trim()}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
      >
        進入系統
      </button>
    </form>
  )
}
