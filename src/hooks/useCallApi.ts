import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import apiClient, { ApiResponse, ApiError } from '@/libs/apiClient'

// Helper type để extract data từ ApiResponse
type ExtractData<T> = T extends ApiResponse<infer U> ? U : T

// Query hook
export function useApiQuery<TData = any, TError = ApiError>(
  queryKey: string[],
  url: string,
  options?: Omit<UseQueryOptions<ApiResponse<TData>, TError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ApiResponse<TData>, TError>({
    queryKey,
    queryFn: async () => {
      return await apiClient.get<TData>(url)
    },
    ...options,
  })
}

// Mutation hook
export function useApiMutation<TData = any, TVariables = any, TError = ApiError>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: Omit<UseMutationOptions<ApiResponse<TData>, TError, TVariables>, 'mutationFn'>
) {
  return useMutation<ApiResponse<TData>, TError, TVariables>({
    mutationFn,
    ...options,
  })
}

// POST mutation hook
export function useApiPost<TData = any, TVariables = any, TError = ApiError>(
  url: string,
  options?: Omit<UseMutationOptions<ApiResponse<TData>, TError, TVariables>, 'mutationFn'>
) {
  return useApiMutation<TData, TVariables, TError>(
    async (variables) => {
      return await apiClient.post<TData>(url, variables)
    },
    options
  )
}

// PUT mutation hook
export function useApiPut<TData = any, TVariables = any, TError = ApiError>(
  url: string,
  options?: Omit<UseMutationOptions<ApiResponse<TData>, TError, TVariables>, 'mutationFn'>
) {
  return useApiMutation<TData, TVariables, TError>(
    async (variables) => {
      return await apiClient.put<TData>(url, variables)
    },
    options
  )
}

// PATCH mutation hook
export function useApiPatch<TData = any, TVariables = any, TError = ApiError>(
  url: string,
  options?: Omit<UseMutationOptions<ApiResponse<TData>, TError, TVariables>, 'mutationFn'>
) {
  return useApiMutation<TData, TVariables, TError>(
    async (variables) => {
      return await apiClient.patch<TData>(url, variables)
    },
    options
  )
}

// DELETE mutation hook
export function useApiDelete<TData = any, TError = ApiError>(
  url: string,
  options?: Omit<UseMutationOptions<ApiResponse<TData>, TError, void>, 'mutationFn'>
) {
  return useApiMutation<TData, void, TError>(
    async () => {
      return await apiClient.delete<TData>(url)
    },
    options
  )
}

// Export types
export type { ApiResponse, ApiError }

