import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@/i18n/navigation'
import { authService, LoginRequest, LoginResponse } from '@/services/auth/authService'
import { setCredentials, logout } from '@/store/slices/authSlice'
import { useAppDispatch } from '@/store'
import { setToken, removeToken } from '@/libs/Auth'
import { ApiError, ApiResponse } from '@/libs/apiClient'

export function useLogin(rememberMe = false) {
  const dispatch = useAppDispatch()
  const router = useRouter()

  return useMutation<ApiResponse<LoginResponse>, ApiError, LoginRequest>({
    mutationFn: authService.login,
    onSuccess: (response) => {
      const { token, user } = response.data

      // 1. Lưu token vào storage
      setToken(token, rememberMe ? 'localStorage' : 'sessionStorage')

      // 2. Lưu user + token vào Redux store
      dispatch(setCredentials({ user, token }))

      // 3. Redirect về trang chủ
      router.push('/')
      router.refresh()
    },
  })
}

export function useLogout() {
  const dispatch = useAppDispatch()
  const router = useRouter()

  return useMutation<ApiResponse<void>, ApiError, void>({
    mutationFn: authService.logout,
    onSettled: () => {
      // Dù API thành công hay lỗi đều clear state
      removeToken()
      dispatch(logout())
      router.push('/login')
    },
  })
}
