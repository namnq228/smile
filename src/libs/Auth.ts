export const setToken = (token: string, storage: 'localStorage' | 'sessionStorage' = 'localStorage'): void => {
	if (typeof window !== 'undefined') {
		if (storage === 'localStorage') {
			localStorage.setItem('token', token)
		} else {
			sessionStorage.setItem('token', token)
		}
	}
}

export const getToken = () => {
	return localStorage.getItem('token') || sessionStorage.getItem('token')
} 

export const removeToken = (): void => {
	if (typeof window !== 'undefined') {
		localStorage.removeItem('token')
		sessionStorage.removeItem('token')
	}
}

