import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState, User, UserRole } from './types'

interface AuthStore extends AuthState {
  _hasHydrated: boolean
  setHasHydrated: (value: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      isAuthenticated: false,
      user: null,
      token: null,
      _hasHydrated: false,

      // Actions
      setHasHydrated: (value: boolean) => set({ _hasHydrated: value }),

      hasRole: (role: UserRole) => {
        const { user } = get()
        return user?.role === role
      },

      isStudent: () => {
        return get().hasRole('student')
      },

      isLecturer: () => {
        return get().hasRole('lecturer')
      },

      login: ({ user, token }: { user: User; token: string }) => {
        set({
          user,
          token,
          isAuthenticated: true,
        })
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

// Hook for accessing auth in components
export function useAuth(): AuthState {
  const store = useAuthStore()
  return {
    isAuthenticated: store.isAuthenticated,
    user: store.user,
    token: store.token,
    hasRole: store.hasRole,
    isStudent: store.isStudent,
    isLecturer: store.isLecturer,
    login: store.login,
    logout: store.logout,
  }
}

// Function to get auth state for router context (outside React)
export function getAuthState(): AuthState {
  const state = useAuthStore.getState()
  return {
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    token: state.token,
    hasRole: state.hasRole,
    isStudent: state.isStudent,
    isLecturer: state.isLecturer,
    login: state.login,
    logout: state.logout,
  }
}
