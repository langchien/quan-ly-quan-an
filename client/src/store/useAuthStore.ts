import type { AccountType } from '@/schemaValidations/account.schema'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AccountType | null
}

interface AuthActions {
  setAccessToken: (token: string | null) => void
  setRefreshToken: (token: string | null) => void
  setUser: (user: AccountType | null) => void
  setAuth: (data: { accessToken: string; refreshToken: string; user?: AccountType | null }) => void
  logout: () => void
}

type AuthStore = AuthState & AuthActions

/**
 * Kiểm tra user đã xác thực hay chưa (dùng bên ngoài React component).
 * Bên trong component dùng: `useAuthStore(state => !!state.accessToken)`
 */
export const isAuthenticated = () => Boolean(useAuthStore.getState().accessToken)

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      setAccessToken: token => set({ accessToken: token }),

      setRefreshToken: token => set({ refreshToken: token }),

      setUser: user => set({ user }),

      setAuth: ({ accessToken, refreshToken, user }) =>
        set(prev => ({
          accessToken,
          refreshToken,
          // Giữ nguyên user cũ nếu không truyền user mới
          user: user !== undefined ? user : prev.user,
        })),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
        }),
    }),
    {
      name: 'auth-storage', // Key trong localStorage
      // Chỉ persist token & user, bỏ qua các action function
      partialize: state => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
)
