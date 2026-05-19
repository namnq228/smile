import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/store/slices/authSlice'

/**
 * Tạo Redux store riêng cho mỗi test (tránh state bị chia sẻ giữa các test)
 */
const createTestStore = () =>
  configureStore({
    reducer: { auth: authReducer },
  })

/**
 * Wrapper bọc QueryClientProvider + Redux Provider cho renderHook / render trong test
 */
export function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const store = createTestStore()

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  )
}
