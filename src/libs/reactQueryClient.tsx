'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Thời gian cache mặc định là 5 phút
            staleTime: 5 * 60 * 1000,
            // Thời gian cache tối đa là 10 phút
            gcTime: 10 * 60 * 1000,
            // Retry 3 lần khi thất bại
            retry: 3,
            // Refetch khi window focus
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}


