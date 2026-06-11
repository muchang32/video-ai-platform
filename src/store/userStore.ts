import { create } from 'zustand'

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

const ALLOWED_DOMAIN = '@udngroup.com'

export function isCompanyEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(ALLOWED_DOMAIN)
}

function generateId(): string {
  return `usr_${Math.random().toString(36).slice(2, 10)}`
}

function loadUsers(): User[] {
  try { return JSON.parse(localStorage.getItem('vap_users') ?? '[]') } catch { return [] }
}

function saveUsers(users: User[]) {
  localStorage.setItem('vap_users', JSON.stringify(users))
}

interface UserStore {
  users: User[]
  currentUserId: string | null
  currentUser: User | null
  createUser: (name: string, email: string) => User | { error: string }
  selectUser: (id: string) => void
  deleteUser: (id: string) => void
  logout: () => void
}

const initialUsers = loadUsers()
const initialCurrentId = localStorage.getItem('vap_current_user')
const initialCurrentUser = initialUsers.find((u) => u.id === initialCurrentId) ?? null

export const useUserStore = create<UserStore>((set, get) => ({
  users: initialUsers,
  currentUserId: initialCurrentId,
  currentUser: initialCurrentUser,

  createUser: (name, email) => {
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedName = name.trim()

    if (!trimmedName) return { error: '請輸入名稱' }
    if (!trimmedEmail) return { error: '請輸入 Email' }
    if (!isCompanyEmail(trimmedEmail)) return { error: `僅限 ${ALLOWED_DOMAIN} 帳號使用` }
    if (get().users.some((u) => u.email === trimmedEmail)) {
      return { error: '此 Email 已有帳號，請直接選擇' }
    }

    const user: User = {
      id: generateId(),
      name: trimmedName,
      email: trimmedEmail,
      createdAt: new Date().toISOString(),
    }
    const users = [...get().users, user]
    saveUsers(users)
    localStorage.setItem('vap_current_user', user.id)
    set({ users, currentUserId: user.id, currentUser: user })
    return user
  },

  selectUser: (id) => {
    const user = get().users.find((u) => u.id === id) ?? null
    if (!user) return
    localStorage.setItem('vap_current_user', id)
    set({ currentUserId: id, currentUser: user })
  },

  deleteUser: (id) => {
    const users = get().users.filter((u) => u.id !== id)
    saveUsers(users)
    const isCurrentDeleted = get().currentUserId === id
    const next = isCurrentDeleted ? (users[0] ?? null) : get().currentUser
    if (next?.id) localStorage.setItem('vap_current_user', next.id)
    else localStorage.removeItem('vap_current_user')
    set({ users, currentUserId: next?.id ?? null, currentUser: next })
  },

  logout: () => {
    localStorage.removeItem('vap_current_user')
    set({ currentUserId: null, currentUser: null })
  },
}))
