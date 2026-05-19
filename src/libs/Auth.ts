const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 ngày

export const setToken = (token: string, storage: 'localStorage' | 'sessionStorage' = 'localStorage'): void => {
	if (typeof window !== 'undefined') {
		const store = storage === 'localStorage' ? localStorage : sessionStorage
		store.setItem(ACCESS_TOKEN_KEY, token)
		// Lưu cookie để middleware đọc được
		const maxAge = storage === 'localStorage' ? `; max-age=${COOKIE_MAX_AGE}` : ''
		document.cookie = `${ACCESS_TOKEN_KEY}=${token}; path=/; SameSite=Lax${maxAge}`
	}
}

export const getToken = (): string | null => {
	if (typeof window === 'undefined') return null
	return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

export const removeToken = (): void => {
	if (typeof window !== 'undefined') {
		localStorage.removeItem(ACCESS_TOKEN_KEY)
		sessionStorage.removeItem(ACCESS_TOKEN_KEY)
		// Xoá cookie
		document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
	}
}

export const setRefreshToken = (token: string, storage: 'localStorage' | 'sessionStorage' = 'localStorage'): void => {
	if (typeof window !== 'undefined') {
		const store = storage === 'localStorage' ? localStorage : sessionStorage
		store.setItem(REFRESH_TOKEN_KEY, token)
	}
}

export const getRefreshToken = (): string | null => {
	if (typeof window === 'undefined') return null
	return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY)
}

export const removeRefreshToken = (): void => {
	if (typeof window !== 'undefined') {
		localStorage.removeItem(REFRESH_TOKEN_KEY)
		sessionStorage.removeItem(REFRESH_TOKEN_KEY)
	}
}

export const clearAuth = (): void => {
	removeToken()
	removeRefreshToken()
}

