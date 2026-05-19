'use client'

import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { setCredentials } from '@/store/slices/authSlice'
import { AuthUser } from '@/store/slices/authSlice'
import { getToken, getRefreshToken, getUser, clearAuth } from '@/libs/Auth'

/**
 * Hydrate Redux auth state từ cookie khi app khởi động / reload.
 * Không cần gọi API — đọc trực tiếp từ cookie.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Nếu Redux đã có state (login trong cùng session) → bỏ qua
    if (isAuthenticated) return

    const accessToken = getToken()
    const refreshToken = getRefreshToken()
    const user = getUser<AuthUser>()

    if (accessToken && user) {
      dispatch(setCredentials({
        user,
        accessToken,
        refreshToken: refreshToken ?? '',
      }))
    } else if (accessToken && !user) {
      // Có token nhưng không có user data → xoá để force login lại
      clearAuth()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>
}
