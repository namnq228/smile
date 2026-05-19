const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_KEY = 'authUser'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 ngày

const setCookie = (name: string, value: string, maxAge?: number): void => {
	const age = maxAge ? `; max-age=${maxAge}` : ''
	document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax${age}`
}

const getCookie = (name: string): string | null => {
	const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
	return match ? decodeURIComponent(match[1]) : null
}

const removeCookie = (name: string): void => {
	document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

export const setToken = (token: string, storage: 'localStorage' | 'sessionStorage' = 'localStorage'): void => {
	if (typeof window !== 'undefined') {
		setCookie(ACCESS_TOKEN_KEY, token, storage === 'localStorage' ? COOKIE_MAX_AGE : undefined)
	}
}

export const getToken = (): string | null => {
	if (typeof window === 'undefined') return null
	return getCookie(ACCESS_TOKEN_KEY)
}

export const removeToken = (): void => {
	if (typeof window !== 'undefined') {
		removeCookie(ACCESS_TOKEN_KEY)
	}
}

export const setRefreshToken = (token: string, storage: 'localStorage' | 'sessionStorage' = 'localStorage'): void => {
	if (typeof window !== 'undefined') {
		setCookie(REFRESH_TOKEN_KEY, token, storage === 'localStorage' ? COOKIE_MAX_AGE : undefined)
	}
}

export const getRefreshToken = (): string | null => {
	if (typeof window === 'undefined') return null
	return getCookie(REFRESH_TOKEN_KEY)
}

export const removeRefreshToken = (): void => {
	if (typeof window !== 'undefined') {
		removeCookie(REFRESH_TOKEN_KEY)
	}
}

export const clearAuth = (): void => {
	removeToken()
	removeRefreshToken()
	removeUser()
}

export const setUser = (user: object, persistent = true): void => {
	if (typeof window !== 'undefined') {
		setCookie(USER_KEY, JSON.stringify(user), persistent ? COOKIE_MAX_AGE : undefined)
	}
}

export const getUser = <T = unknown>(): T | null => {
	if (typeof window === 'undefined') return null
	const raw = getCookie(USER_KEY)
	try {
		return raw ? (JSON.parse(raw) as T) : null
	} catch {
		return null
	}
}

export const removeUser = (): void => {
	if (typeof window !== 'undefined') {
		removeCookie(USER_KEY)
	}
}

