import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@/i18n/navigation'
import { authService, LoginRequest, LoginResponse } from '@/services/auth/authService'
import { setCredentials, logout } from '@/store/slices/authSlice'
import { useAppDispatch } from '@/store'
import { setToken, setRefreshToken, clearAuth, setUser } from '@/libs/Auth'
import { ApiError, ApiResponse } from '@/libs/apiClient'

export function useLogin(rememberMe = false) {
  const dispatch = useAppDispatch()
  const router = useRouter()

  return useMutation<ApiResponse<LoginResponse>, ApiError, LoginRequest>({
    mutationFn: authService.login,
    onSuccess: (response) => {
      // API trả về trực tiếp LoginResponse (không bọc trong { data: ... })
      const loginData = (response as unknown as LoginResponse)

      const { accessToken, refreshToken, userId, userName, userRoles, userPermissions, userProfileImage } = loginData

      // 1. Lưu tokens vào storage
      const storageType = rememberMe ? 'localStorage' : 'sessionStorage'
      const persistent = rememberMe
      setToken(accessToken, storageType)
      setRefreshToken(refreshToken, storageType)
      setUser({ userId, userName, userRoles, userPermissions, userProfileImage }, persistent)

      // 2. Lưu user + tokens vào Redux store
      dispatch(setCredentials({
        user: { userId, userName, userRoles, userPermissions, userProfileImage },
        accessToken,
        refreshToken,
      }))

      // 3. Redirect về trang chủ
      router.push('/')
      router.refresh()
    },
  })
}

export function useLogout() {
  const dispatch = useAppDispatch()
  const router = useRouter()

  return useMutation<void, never, void>({
    mutationFn: async () => {
      // Gọi server trước (cần đọc token từ cookie)
      try { await authService.logout() } catch { /* bỏ qua */ }
      // Sau đó mới xoá auth
      clearAuth()
      dispatch(logout())
    },
    onSettled: () => {
      router.push('/login')
    },
  })
}
