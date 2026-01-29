import { useAuth } from '../auth'

export function usePermissions() {
  const auth = useAuth()

  return {
    hasRole: auth.hasRole,
    isStudent: auth.isStudent,
    isLecturer: auth.isLecturer,
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
  }
}
