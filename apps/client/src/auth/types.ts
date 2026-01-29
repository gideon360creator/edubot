// User roles matching server model
export type UserRole = 'student' | 'lecturer'

export interface User {
  id: string
  username: string
  fullName: string
  role: UserRole
  studentNumber?: string | null
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  hasRole: (role: UserRole) => boolean
  isStudent: () => boolean
  isLecturer: () => boolean
  login: (data: { user: User; token: string }) => void
  logout: () => void
}
