import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Permission } from '@/services/auth/authService'

export interface AuthUser {
  userId: string
  userName: string
  userRoles: string[]
  userPermissions: Permission[]
  userProfileImage: string
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; accessToken: string; refreshToken: string }>
    ) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.isAuthenticated = true
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
