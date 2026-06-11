import { useState, useRef, useEffect, type FormEvent } from 'react'
import { useUserStore, isCompanyEmail } from '../../store/userStore'

const DOMAIN = '@udngroup.com'

export function UserSelector() {
  const { users, currentUser, createUser, selectUser, deleteUser, logout } = useUserStore()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [formError, setFormError] = useState('')
  const [emailHint, setEmailHint] = useState<'valid' | 'invalid' | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
        setCreating(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  useEffect(() => {
    if (creating) nameInputRef.current?.focus()
  }, [creating])

  function onEmailChange(val: string) {
    setNewEmail(val)
    if (val.includes('@')) setEmailHint(isCompanyEmail(val) ? 'valid' : 'invalid')
    else setEmailHint(null)
    setFormError('')
  }

  function onCreateSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    const result = createUser(newName, newEmail)
    if ('error' in result) { setFormError(result.error); return }
    setNewName(''); setNewEmail(''); setCreating(false); setOpen(false); setEmailHint(null)
  }

  function handleLogout() {
    setOpen(false)
    logout()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { setOpen((o) => !o); setCreating(false) }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm"
        aria-label="使用者選單"
        aria-expanded={open}
      >
        <span className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0" aria-hidden="true">
          {currentUser ? currentUser.name.slice(0, 1).toUpperCase() : '?'}
        </span>
        <div className="text-left hidden sm:block">
          <p className="font-medium text-white leading-tight">{currentUser?.name ?? '未登入'}</p>
          <p className="text-blue-200 text-xs truncate max-w-36">{currentUser?.email ?? ''}</p>
        </div>
        <svg className="w-4 h-4 text-blue-200 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Current user info */}
          {currentUser && (
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-xs text-gray-400 mb-0.5">目前帳號</p>
              <p className="text-sm font-semibold text-gray-800">{currentUser.name}</p>
              <p className="text-xs text-gray-500 font-mono">{currentUser.email}</p>
            </div>
          )}

          {/* Other users */}
          {users.length > 1 && (
            <>
              <p className="px-3 pt-2 text-xs text-gray-400">切換帳號</p>
              <div className="py-1 max-h-40 overflow-y-auto">
                {users.filter((u) => u.id !== currentUser?.id).map((u) => (
                  <div key={u.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 group">
                    <button
                      onClick={() => { selectUser(u.id); setOpen(false) }}
                      className="flex-1 flex items-center gap-2 text-left min-w-0"
                    >
                      <span className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0" aria-hidden="true">
                        {u.name.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                    </button>
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 transition-all shrink-0"
                      aria-label={`刪除 ${u.name}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100" />
            </>
          )}

          {/* Add new account */}
          {creating ? (
            <form onSubmit={onCreateSubmit} className="p-3 space-y-2">
              <p className="text-xs font-medium text-gray-500">新增帳號</p>
              <input
                ref={nameInputRef}
                type="text"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setFormError('') }}
                placeholder="姓名"
                maxLength={30}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="relative">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder={`yourname${DOMAIN}`}
                  className={`w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-7 ${
                    emailHint === 'invalid' ? 'border-red-300 bg-red-50' :
                    emailHint === 'valid'   ? 'border-green-300' : 'border-gray-300'
                  }`}
                />
                {emailHint === 'valid' && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-500 text-sm">✓</span>}
              </div>
              {emailHint === 'invalid' && <p className="text-xs text-red-500">必須使用 {DOMAIN} 信箱</p>}
              {formError && <p className="text-xs text-red-500">{formError}</p>}
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                  建立
                </button>
                <button
                  type="button"
                  onClick={() => { setCreating(false); setNewName(''); setNewEmail(''); setFormError(''); setEmailHint(null) }}
                  className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新增帳號
            </button>
          )}

          {/* Logout */}
          <div className="border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              登出
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
