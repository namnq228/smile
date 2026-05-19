import apiClient, { ApiResponse } from '@/libs/apiClient'

export interface LoginRequest {
  userName: string
  password: string
}

export interface Permission {
  id: string
  createdAt: number
  createdBy: string
  updatedAt: number
  updatedBy: string
  code: string
  name: string
  category: string
  uri: string
  isPermitAll: boolean
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  userId: string
  userName: string
  userPermissions: Permission[]
  userRoles: string[]
  userProfileImage: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export const authService = {
  login: (data: LoginRequest): Promise<ApiResponse<LoginResponse>> =>
    apiClient.post<LoginResponse>('/api/auth/login', data, { skipAuth: true }),

  refreshToken: (data: RefreshTokenRequest): Promise<ApiResponse<LoginResponse>> =>
    apiClient.post<LoginResponse>('/api/auth/refresh-token', data, { skipAuth: true }),

  logout: (): Promise<ApiResponse<void>> =>
    apiClient.post<void>('/api/auth/logout'),

  getMe: (): Promise<ApiResponse<LoginResponse>> =>
    apiClient.get<LoginResponse>('/api/auth/me'),
}
