import { authService } from '../authService'
import apiClient from '@/libs/apiClient'
import * as Auth from '@/libs/Auth'

// Mock toàn bộ apiClient
jest.mock('@/libs/apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))

// Mock Auth để kiểm soát token trả về
jest.mock('@/libs/Auth', () => ({
  getToken: jest.fn(),
  getRefreshToken: jest.fn(),
}))

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>
const mockGetToken = Auth.getToken as jest.MockedFunction<typeof Auth.getToken>
const mockGetRefreshToken = Auth.getRefreshToken as jest.MockedFunction<typeof Auth.getRefreshToken>

const mockLoginResponse = {
  accessToken: 'access-token-abc',
  refreshToken: 'refresh-token-xyz',
  userId: 'user-001',
  userName: 'testuser',
  userPermissions: [],
  userRoles: ['ROLE_USER'],
  userProfileImage: '',
}

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── LOGIN ───────────────────────────────────────────────────────────────

  describe('login', () => {
    it('gọi POST /api/auth/login với đúng payload', async () => {
      mockApiClient.post.mockResolvedValue(mockLoginResponse as any)

      await authService.login({ userName: 'testuser', password: '123456' })

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/auth/login',
        { userName: 'testuser', password: '123456' },
        { skipAuth: true }
      )
    })

    it('trả về data khi login thành công', async () => {
      mockApiClient.post.mockResolvedValue(mockLoginResponse as any)

      const result = await authService.login({ userName: 'testuser', password: '123456' })

      expect(result).toEqual(mockLoginResponse)
    })

    it('ném lỗi khi login thất bại', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Unauthorized'))

      await expect(
        authService.login({ userName: 'wrong', password: 'wrong' })
      ).rejects.toThrow('Unauthorized')
    })
  })

  // ─── LOGOUT ──────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('gọi POST /api/auth/logout với accessToken và refreshToken từ cookie', async () => {
      mockGetToken.mockReturnValue('my-access-token')
      mockGetRefreshToken.mockReturnValue('my-refresh-token')
      mockApiClient.post.mockResolvedValue(undefined as any)

      await authService.logout()

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/auth/logout',
        {
          accessToken: 'my-access-token',
          refreshToken: 'my-refresh-token',
        },
        { skipAuthRedirect: true }
      )
    })

    it('gửi chuỗi rỗng khi không có token trong cookie', async () => {
      mockGetToken.mockReturnValue(null)
      mockGetRefreshToken.mockReturnValue(null)
      mockApiClient.post.mockResolvedValue(undefined as any)

      await authService.logout()

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/auth/logout',
        { accessToken: '', refreshToken: '' },
        { skipAuthRedirect: true }
      )
    })

    it('không ném lỗi khi server trả về lỗi (skipAuthRedirect)', async () => {
      mockGetToken.mockReturnValue('token')
      mockGetRefreshToken.mockReturnValue('refresh')
      mockApiClient.post.mockRejectedValue(new Error('401'))

      await expect(authService.logout()).rejects.toThrow('401')
    })
  })
})
