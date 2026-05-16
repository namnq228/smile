import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getToken } from './Auth'

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuth?: boolean
  }
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
          config.headers.Authorization = `Bearer ${token}`
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
    (error: AxiosError) => {
      let apiResponse: ApiResponse

      if (error.response) {
        apiResponse = error.response.data as ApiResponse
        const status = error.response.status
        switch (status) {
          case 401:
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token')
              sessionStorage.removeItem('token')
              window.location.href = '/login'
            }
            break
          case 403:
            console.error('Access forbidden')
            break
          case 404:
            console.error('Resource not found')
            break
          case 500:
            console.error('Server error')
            break
        }
      } else if (error.request) {
        apiResponse = {
          data: null,
          message: 'Network error. Please check your connection.',
          status: 0,
        }
      } else {
        apiResponse = {
          data: null,
          message: error.message || 'An unexpected error occurred',
          status: undefined,
        }
      }

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

