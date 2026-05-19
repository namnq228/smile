import { renderHook, act, waitFor } from '@testing-library/react'
import { useLogin, useLogout } from '../useAuth'
import { authService } from '@/services/auth/authService'
import * as Auth from '@/libs/Auth'
import { wrapper } from '@/test-utils/wrapper'

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('@/services/auth/authService', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
  },
}))

jest.mock('@/libs/Auth', () => ({
  setToken: jest.fn(),
  setRefreshToken: jest.fn(),
  clearAuth: jest.fn(),
}))

const mockPush = jest.fn()
const mockRefresh = jest.fn()

jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

// Mock Redux dispatch
const mockDispatch = jest.fn()
jest.mock('@/store', () => ({
  useAppDispatch: () => mockDispatch,
}))

// ─── Dữ liệu mẫu ─────────────────────────────────────────────────────────────

const mockLoginResponse = {
  accessToken: 'access-token-abc',
  refreshToken: 'refresh-token-xyz',
  userId: 'user-001',
  userName: 'testuser',
  userPermissions: [],
  userRoles: ['ROLE_USER'],
  userProfileImage: '',
}

// ─── useLogin ─────────────────────────────────────────────────────────────────

describe('useLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('lưu token và redirect khi login thành công', async () => {
    ;(authService.login as jest.Mock).mockResolvedValue(mockLoginResponse)

    const { result } = renderHook(() => useLogin(true), { wrapper })

    await act(async () => {
      result.current.mutate({ userName: 'testuser', password: '123456' })
    })

    expect(authService.login).toHaveBeenCalledWith(
      { userName: 'testuser', password: '123456' },
      expect.any(Object)
    )
    expect(Auth.setToken).toHaveBeenCalledWith('access-token-abc', 'localStorage')
    expect(Auth.setRefreshToken).toHaveBeenCalledWith('refresh-token-xyz', 'localStorage')
    expect(mockDispatch).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/')
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('lưu token dạng sessionStorage khi rememberMe = false', async () => {
    ;(authService.login as jest.Mock).mockResolvedValue(mockLoginResponse)

    const { result } = renderHook(() => useLogin(false), { wrapper })

    await act(async () => {
      result.current.mutate({ userName: 'testuser', password: '123456' })
    })

    expect(Auth.setToken).toHaveBeenCalledWith('access-token-abc', 'sessionStorage')
    expect(Auth.setRefreshToken).toHaveBeenCalledWith('refresh-token-xyz', 'sessionStorage')
  })

  it('không redirect khi login thất bại', async () => {
    ;(authService.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'))

    const { result } = renderHook(() => useLogin(), { wrapper })

    await act(async () => {
      result.current.mutate({ userName: 'wrong', password: 'wrong' })
    })

    expect(mockPush).not.toHaveBeenCalled()
    expect(Auth.setToken).not.toHaveBeenCalled()
  })

  it('isError = true khi login thất bại', async () => {
    ;(authService.login as jest.Mock).mockRejectedValue(new Error('Unauthorized'))

    const { result } = renderHook(() => useLogin(), { wrapper })

    await act(async () => {
      result.current.mutate({ userName: 'bad', password: 'bad' })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

// ─── useLogout ────────────────────────────────────────────────────────────────

describe('useLogout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('gọi authService.logout trước rồi mới clearAuth', async () => {
    const callOrder: string[] = []
    ;(authService.logout as jest.Mock).mockImplementation(async () => {
      callOrder.push('authService.logout')
    })
    ;(Auth.clearAuth as jest.Mock).mockImplementation(() => {
      callOrder.push('clearAuth')
    })

    const { result } = renderHook(() => useLogout(), { wrapper })

    await act(async () => {
      result.current.mutate()
    })

    expect(callOrder).toEqual(['authService.logout', 'clearAuth'])
  })

  it('redirect về /login sau khi logout', async () => {
    ;(authService.logout as jest.Mock).mockResolvedValue(undefined)

    const { result } = renderHook(() => useLogout(), { wrapper })

    await act(async () => {
      result.current.mutate()
    })

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('vẫn clearAuth và redirect dù authService.logout lỗi', async () => {
    ;(authService.logout as jest.Mock).mockRejectedValue(new Error('401'))

    const { result } = renderHook(() => useLogout(), { wrapper })

    await act(async () => {
      result.current.mutate()
    })

    expect(Auth.clearAuth).toHaveBeenCalled()
    expect(mockDispatch).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})
