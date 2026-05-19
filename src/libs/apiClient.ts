import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getToken, getRefreshToken, setToken, setRefreshToken, clearAuth } from './Auth'

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuth?: boolean
    _retry?: boolean
    skipAuthRedirect?: boolean
  }
}

let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  failedQueue = []
}

export interface ApiResponse<T = any> {
  data: T
  message?: string
  status?: number
}

export class ApiError extends Error {
  data: any
  status?: number
  message: string

  constructor(response: ApiResponse) {
    super(response.message || 'An error occurred')
    this.name = 'ApiError'
    this.data = response.data
    this.status = response.status
    this.message = response.message || 'An error occurred'
  }
}

const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/',
    timeout: 30000, // 30 giây
    headers: {
      'Content-Type': 'application/json',
    },
  })
  instance.defaults.headers.common['Accept-Language'] = 'vi'

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (config.skipAuth) {
        if (config.headers) {
          config.headers.Authorization = undefined as any
          if (config.headers.common) {
            config.headers.common.Authorization = undefined as any
          }
        }
      } else if (typeof window !== 'undefined') {
        const token = getToken()
        if (token && config.headers) {
          config.headers.Authorization = token
        }
      }

      return config
    },
    (error: AxiosError) => {
      return Promise.reject(error)
    }
  )

  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      return response
    },
    async (error: AxiosError) => {
      if (error.response) {
        const status = error.response.status
        const originalConfig = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        if (status === 401 && typeof window !== 'undefined') {
          // Bỏ qua refresh/redirect nếu request đã đánh dấu skipAuthRedirect
          if (originalConfig?.skipAuthRedirect) {
            const apiResponse = error.response.data as ApiResponse
            return Promise.reject(new ApiError(apiResponse))
          }

          const refreshToken = getRefreshToken()

          if (!originalConfig?._retry && refreshToken) {
            if (isRefreshing) {
              return new Promise<string>((resolve, reject) => {
                failedQueue.push({ resolve, reject })
              }).then((token) => {
                if (originalConfig.headers) {
                  originalConfig.headers.Authorization = token
                }
                return instance(originalConfig)
              })
            }

            originalConfig._retry = true
            isRefreshing = true

            return new Promise((resolve, reject) => {
              axios
                .post('/api/auth/refresh-token', { refreshToken })
                .then((res) => {
                  const { accessToken, refreshToken: newRefreshToken } = res.data as { accessToken: string; refreshToken: string }
                  setToken(accessToken)
                  setRefreshToken(newRefreshToken)
                  instance.defaults.headers.common.Authorization = accessToken
                  processQueue(null, accessToken)
                  if (originalConfig.headers) {
                    originalConfig.headers.Authorization = accessToken
                  }
                  resolve(instance(originalConfig))
                })
                .catch((err) => {
                  processQueue(err, null)
                  clearAuth()
                  window.location.href = '/login'
                  reject(err)
                })
                .finally(() => {
                  isRefreshing = false
                })
            })
          }

          clearAuth()
          window.location.href = '/login'
        } else if (status === 403) {
          console.error('Access forbidden')
        } else if (status === 404) {
          console.error('Resource not found')
        } else if (status === 500) {
          console.error('Server error')
        }

        const apiResponse = error.response.data as ApiResponse
        return Promise.reject(new ApiError(apiResponse))
      }

      const apiResponse: ApiResponse = error.request
        ? { data: null, message: 'Network error. Please check your connection.', status: 0 }
        : { data: null, message: error.message || 'An unexpected error occurred', status: undefined }

      return Promise.reject(new ApiError(apiResponse))
    }
  )

  return instance
}

const apiInstance = createApiClient()

export const get = async <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  const response = await apiInstance.get<ApiResponse<T>>(url, config)
  return response.data as ApiResponse<T>
}

export const post = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  const response = await apiInstance.post<ApiResponse<T>>(url, data, config)
  return response.data as ApiResponse<T>
}

export const put = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  const response = await apiInstance.put<ApiResponse<T>>(url, data, config)
  return response.data as ApiResponse<T>
}

export const patch = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  const response = await apiInstance.patch<ApiResponse<T>>(url, data, config)
  return response.data as ApiResponse<T>
}

export const del = async <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  const response = await apiInstance.delete<ApiResponse<T>>(url, config)
  return response.data as ApiResponse<T>
}

export const upload = async <T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  const response = await apiInstance.post<ApiResponse<T>>(url, formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...config?.headers,
    },
  })
  return response.data as ApiResponse<T>
}

export const getInstance = (): AxiosInstance => {
  return apiInstance
}

const apiClient = {
  get,
  post,
  put,
  patch,
  delete: del,
  upload,
  getInstance,
}

export default apiClient

