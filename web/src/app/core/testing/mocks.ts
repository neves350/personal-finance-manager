import { vi } from 'vitest'

export const mockAuth = {
	login: vi.fn(),
	googleLogin: vi.fn(),
	register: vi.fn(),
	logout: vi.fn(),
	refresh: vi.fn(),
	getProfile: vi.fn(),
	requestPasswordRecover: vi.fn(),
	resetPassword: vi.fn(),
	verifyAuth: vi.fn(),
	isAuthenticated: vi.fn(),
	clearAuth: vi.fn(),
}

export const mockRouter = {
	navigate: vi.fn(),
}
