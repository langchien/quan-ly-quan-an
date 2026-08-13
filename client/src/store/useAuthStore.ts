import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
}

interface AuthActions {
  setAccessToken: (token: string | null) => void
  setRefreshToken: (token: string | null) => void
  setTokens: ({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) => void
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

      setAccessToken: token => set({ accessToken: token }),

      setRefreshToken: token => set({ refreshToken: token }),

      setTokens: ({ accessToken, refreshToken }) => set({ accessToken, refreshToken }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
        }),
    }),
    {
      name: 'auth-storage', // Key trong localStorage
      // Chỉ persist token & user, bỏ qua các action function
      partialize: state => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
