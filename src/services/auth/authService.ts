import apiClient, { ApiResponse } from '@/libs/apiClient'

export interface LoginRequest {
  userName: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    userName: string
    email?: string
    roles?: string[]
  }
}

export const authService = {
  login: (data: LoginRequest): Promise<ApiResponse<LoginResponse>> =>
    apiClient.post<LoginResponse>('/api/auth/login', data, { skipAuth: true }),

  logout: (): Promise<ApiResponse<void>> =>
    apiClient.post<void>('/api/auth/logout'),

  getMe: (): Promise<ApiResponse<LoginResponse['user']>> =>
    apiClient.get<LoginResponse['user']>('/api/auth/me'),
}
